const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/:pageSlug', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM content_blocks WHERE page_slug = ? ORDER BY sort_order',
      [req.params.pageSlug]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:pageSlug/:sectionKey', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM content_blocks WHERE page_slug = ? AND section_key = ? LIMIT 1',
      [req.params.pageSlug, req.params.sectionKey]
    );
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { page_slug, section_key, title, body_richtext, sort_order } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO content_blocks (page_slug, section_key, title, body_richtext, sort_order) VALUES (?, ?, ?, ?, ?)',
      [page_slug, section_key, title, body_richtext, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:pageSlug/:sectionKey', authenticateAdmin, async (req, res) => {
  const { title, body_richtext, sort_order } = req.body;
  try {
    await db.query(
      `INSERT INTO content_blocks (page_slug, section_key, title, body_richtext, sort_order)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title), body_richtext = VALUES(body_richtext), sort_order = VALUES(sort_order)`,
      [req.params.pageSlug, req.params.sectionKey, title, body_richtext, sort_order || 0]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM content_blocks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
