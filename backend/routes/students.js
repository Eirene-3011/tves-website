const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const q = category
      ? 'SELECT * FROM student_features WHERE category = ? ORDER BY date_posted DESC'
      : 'SELECT * FROM student_features ORDER BY date_posted DESC';
    const [rows] = await db.query(q, category ? [category] : []);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { category, student_name, description, date_posted } = req.body;
  const image_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query('INSERT INTO student_features (category, student_name, description, image_url, date_posted) VALUES (?, ?, ?, ?, ?)',
      [category, student_name, description, image_url, date_posted]);
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { category, student_name, description, date_posted } = req.body;
  const image_url = req.file ? req.file.path : undefined;
  try {
    const sets = ['category=?','student_name=?','description=?','date_posted=?'];
    const vals = [category, student_name, description, date_posted];
    if (image_url) { sets.push('image_url=?'); vals.push(image_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE student_features SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM student_features WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
