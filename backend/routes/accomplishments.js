const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public: list all accomplishments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM accomplishments ORDER BY award_date DESC, id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: add
router.post('/', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { title, description, award_date, awarding_body, sort_order } = req.body;
  const image_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query(
      'INSERT INTO accomplishments (title, description, image_url, award_date, awarding_body, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || '', image_url, award_date || null, awarding_body || '', sort_order || 0]
    );
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: update
router.put('/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { title, description, award_date, awarding_body, sort_order } = req.body;
  const image_url = req.file ? req.file.path : undefined;
  try {
    const sets = ['title=?','description=?','award_date=?','awarding_body=?','sort_order=?'];
    const vals = [title, description || '', award_date || null, awarding_body || '', sort_order || 0];
    if (image_url) { sets.push('image_url=?'); vals.push(image_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE accomplishments SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: delete
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM accomplishments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
