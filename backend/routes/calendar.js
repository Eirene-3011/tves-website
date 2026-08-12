const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM calendar_events ORDER BY start_date');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { event_name, start_date, end_date, is_recurring, category } = req.body;
  try {
    const [r] = await db.query('INSERT INTO calendar_events (event_name, start_date, end_date, is_recurring, category) VALUES (?, ?, ?, ?, ?)',
      [event_name, start_date, end_date || null, is_recurring ? 1 : 0, category || 'general']);
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const { event_name, start_date, end_date, is_recurring, category } = req.body;
  try {
    await db.query('UPDATE calendar_events SET event_name=?, start_date=?, end_date=?, is_recurring=?, category=? WHERE id=?',
      [event_name, start_date, end_date || null, is_recurring ? 1 : 0, category || 'general', req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM calendar_events WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
