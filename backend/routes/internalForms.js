const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are admin-only
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM internal_forms ORDER BY date_uploaded DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateAdmin, upload.single('file'), async (req, res) => {
  const { title, category, is_public } = req.body;
  const file_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query('INSERT INTO internal_forms (title, file_url, category, is_public) VALUES (?, ?, ?, ?)',
      [title, file_url, category || 'other', is_public ? 1 : 0]);
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateAdmin, upload.single('file'), async (req, res) => {
  const { title, category, is_public } = req.body;
  const file_url = req.file ? req.file.path : undefined;
  try {
    const sets = ['title=?','category=?','is_public=?'];
    const vals = [title, category || 'other', is_public ? 1 : 0];
    if (file_url) { sets.push('file_url=?'); vals.push(file_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE internal_forms SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM internal_forms WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
