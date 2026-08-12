const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM faqs ORDER BY sort_order, id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { question, answer_richtext, sort_order } = req.body;
  try {
    const [r] = await db.query('INSERT INTO faqs (question, answer_richtext, sort_order) VALUES (?, ?, ?)', [question, answer_richtext, sort_order || 0]);
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const { question, answer_richtext, sort_order } = req.body;
  try {
    await db.query('UPDATE faqs SET question=?, answer_richtext=?, sort_order=? WHERE id=?', [question, answer_richtext, sort_order || 0, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM faqs WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
