/**
 * visitorStats.js
 * Live Visitor Counter — backend route
 *
 * Strategy:
 *  - Active visitors  : in-memory Map<sessionToken, lastSeen ms>.
 *                       Sessions expire after ACTIVE_TTL (2 minutes).
 *                       Cleaned up on every request.
 *  - Total visits     : persisted in DB (visitor_stats.total_visits).
 *                       Incremented once per unique session token lifetime.
 *  - Today's visitors : persisted in DB (visitor_stats.today_visits +
 *                       visitor_stats.today_date). Resets each calendar day.
 *  - Unique visitors  : persisted in DB (visitor_tokens table).
 *                       A "visitor token" is a UUID generated client-side and
 *                       stored in localStorage. We store a SHA-256 hash only.
 *
 * Endpoints:
 *  POST  /api/visitor-stats/ping  { sessionToken, visitorToken }
 *  GET   /api/visitor-stats
 */

const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const db      = require('../config/db');

/* ── Config ─────────────────────────────────────────────────── */
const ACTIVE_TTL = 2 * 60 * 1000; // 2 min — a session is "active" within this window

/* ── In-memory session store ─────────────────────────────────── */
// Map<sessionToken, { lastSeen: number, counted: boolean }>
// `counted` = whether total_visits / today_visits have been incremented for this session
const activeSessions = new Map();

function sweepExpired() {
  const cutoff = Date.now() - ACTIVE_TTL;
  for (const [token, info] of activeSessions) {
    if (info.lastSeen < cutoff) activeSessions.delete(token);
  }
}

function activeCount() {
  sweepExpired();
  return activeSessions.size;
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/* ── Ensure single stats row exists ──────────────────────────── */
async function ensureStatsRow() {
  const [rows] = await db.query('SELECT id FROM visitor_stats LIMIT 1');
  if (!rows.length) {
    await db.query(
      'INSERT INTO visitor_stats (total_visits, today_visits, today_date, unique_visitors) VALUES (0, 0, ?, 0)',
      [todayStr()]
    );
  }
}

/* ─────────────────────────────────────────────────────────────
   POST /api/visitor-stats/ping
   Body: { sessionToken: string, visitorToken: string }
   ───────────────────────────────────────────────────────────── */
router.post('/ping', async (req, res) => {
  const { sessionToken, visitorToken } = req.body || {};

  if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.length > 128) {
    return res.status(400).json({ error: 'Invalid sessionToken' });
  }

  try {
    await ensureStatsRow();

    const now      = Date.now();
    const existing = activeSessions.get(sessionToken);
    const isNew    = !existing;

    // Refresh session heartbeat
    activeSessions.set(sessionToken, { lastSeen: now, counted: existing?.counted || false });

    if (isNew) {
      // Increment total_visits and today_visits (reset today counter on new day)
      const today = todayStr();
      const [statsRows] = await db.query('SELECT id, today_date FROM visitor_stats LIMIT 1');
      const statsId    = statsRows[0]?.id;
      const storedDate = statsRows[0]?.today_date instanceof Date
        ? statsRows[0].today_date.toISOString().slice(0, 10)
        : String(statsRows[0]?.today_date || '').slice(0, 10);

      if (statsId) {
        if (storedDate === today) {
          await db.query(
            'UPDATE visitor_stats SET total_visits = total_visits + 1, today_visits = today_visits + 1 WHERE id = ?',
            [statsId]
          );
        } else {
          // New calendar day — reset today counter
          await db.query(
            'UPDATE visitor_stats SET total_visits = total_visits + 1, today_visits = 1, today_date = ? WHERE id = ?',
            [today, statsId]
          );
        }
      }

      activeSessions.set(sessionToken, { lastSeen: now, counted: true });
    }

    // Track unique visitor by hashed token
    if (visitorToken && typeof visitorToken === 'string' && visitorToken.length <= 128) {
      const tokenHash = sha256(visitorToken);
      const [dup] = await db.query(
        'SELECT id FROM visitor_tokens WHERE token_hash = ?',
        [tokenHash]
      );
      if (!dup.length) {
        await db.query('INSERT INTO visitor_tokens (token_hash) VALUES (?)', [tokenHash]);
        await db.query(
          'UPDATE visitor_stats SET unique_visitors = unique_visitors + 1 WHERE id = (SELECT id FROM (SELECT id FROM visitor_stats LIMIT 1) _sub)'
        );
      }
    }

    res.json({ ok: true, active: activeCount() });
  } catch (err) {
    // Don't crash the homepage — return gracefully
    console.error('[visitorStats] ping error:', err.message);
    res.json({ ok: false, active: 0 });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/visitor-stats
   Returns: { active, total, today, unique }
   ───────────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    await ensureStatsRow();

    const today = todayStr();
    const [statsRows] = await db.query(
      'SELECT id, total_visits, today_visits, today_date, unique_visitors FROM visitor_stats LIMIT 1'
    );
    const stats = statsRows[0] || {};

    const storedDate = stats.today_date instanceof Date
      ? stats.today_date.toISOString().slice(0, 10)
      : String(stats.today_date || '').slice(0, 10);

    // Reset today_visits if it drifted past midnight without a ping
    if (storedDate && storedDate !== today && stats.id) {
      await db.query(
        'UPDATE visitor_stats SET today_visits = 0, today_date = ? WHERE id = ?',
        [today, stats.id]
      );
      stats.today_visits = 0;
    }

    res.json({
      active: activeCount(),
      total:  Number(stats.total_visits)    || 0,
      today:  Number(stats.today_visits)    || 0,
      unique: Number(stats.unique_visitors) || 0,
    });
  } catch (err) {
    console.error('[visitorStats] get error:', err.message);
    res.json({ active: 0, total: 0, today: 0, unique: 0 });
  }
});

module.exports = router;
