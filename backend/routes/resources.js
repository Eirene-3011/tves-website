const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const q = category
      ? 'SELECT * FROM learning_resources WHERE category = ? ORDER BY id DESC'
      : 'SELECT * FROM learning_resources ORDER BY category, id DESC';
    const [rows] = await db.query(q, category ? [category] : []);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateAdmin, upload.single('file'), async (req, res) => {
  const { category, title, description } = req.body;
  const file_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query('INSERT INTO learning_resources (category, title, description, file_url) VALUES (?, ?, ?, ?)',
      [category, title, description, file_url]);
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateAdmin, upload.single('file'), async (req, res) => {
  const { category, title, description } = req.body;
  const file_url = req.file ? req.file.path : undefined;
  try {
    const sets = ['category=?','title=?','description=?'];
    const vals = [category, title, description];
    if (file_url) { sets.push('file_url=?'); vals.push(file_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE learning_resources SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM learning_resources WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
