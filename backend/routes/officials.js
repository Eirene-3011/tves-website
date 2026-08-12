const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM officials ORDER BY sort_order');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateAdmin, upload.single('photo'), async (req, res) => {
  const { full_name, position, department_office, contact_no, sort_order } = req.body;
  const photo_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query(
      'INSERT INTO officials (full_name, position, department_office, contact_no, photo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, position, department_office, contact_no, photo_url, sort_order || 0]
    );
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateAdmin, upload.single('photo'), async (req, res) => {
  const { full_name, position, department_office, contact_no, sort_order } = req.body;
  const photo_url = req.file ? req.file.path : undefined;
  try {
    const sets = ['full_name=?','position=?','department_office=?','contact_no=?','sort_order=?'];
    const vals = [full_name, position, department_office, contact_no, sort_order || 0];
    if (photo_url) { sets.push('photo_url=?'); vals.push(photo_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE officials SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM officials WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
