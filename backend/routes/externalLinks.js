const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM external_links ORDER BY sort_order');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { label, url, sort_order } = req.body;
  try {
    const [r] = await db.query('INSERT INTO external_links (label, url, sort_order) VALUES (?, ?, ?)', [label, url, sort_order || 0]);
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const { label, url, sort_order } = req.body;
  try {
    await db.query('UPDATE external_links SET label=?, url=?, sort_order=? WHERE id=?', [label, url, sort_order || 0, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM external_links WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
