const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ppas ORDER BY sort_order');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { name, short_description, frequency, sort_order } = req.body;
  const image_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query('INSERT INTO ppas (name, short_description, frequency, image_url, sort_order) VALUES (?, ?, ?, ?, ?)',
      [name, short_description, frequency, image_url, sort_order || 0]);
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { name, short_description, frequency, sort_order } = req.body;
  const image_url = req.file ? req.file.path : undefined;
  try {
    const sets = ['name=?','short_description=?','frequency=?','sort_order=?'];
    const vals = [name, short_description, frequency, sort_order || 0];
    if (image_url) { sets.push('image_url=?'); vals.push(image_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE ppas SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM ppas WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
