const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public: list all alumni (optionally filter featured)
router.get('/', async (req, res) => {
  try {
    const featured = req.query.featured === '1';
    const sql = featured
      ? 'SELECT * FROM alumni WHERE is_featured = 1 ORDER BY sort_order ASC, batch_year DESC, id DESC'
      : 'SELECT * FROM alumni ORDER BY sort_order ASC, batch_year DESC, id DESC';
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Public: get single alumnus
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM alumni WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: add
router.post('/', authenticateAdmin, upload.single('photo'), async (req, res) => {
  const { full_name, batch_year, course_profession, company, location, bio, email, facebook_url, is_featured, sort_order } = req.body;
  const photo_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query(
      `INSERT INTO alumni
        (full_name, batch_year, course_profession, company, location, bio, email, facebook_url, photo_url, is_featured, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name, batch_year || null, course_profession || '', company || '',
        location || '', bio || '', email || '', facebook_url || '',
        photo_url, is_featured === '1' || is_featured === true ? 1 : 0,
        sort_order || 0
      ]
    );
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: update
router.put('/:id', authenticateAdmin, upload.single('photo'), async (req, res) => {
  const { full_name, batch_year, course_profession, company, location, bio, email, facebook_url, is_featured, sort_order } = req.body;
  const photo_url = req.file ? req.file.path : undefined;
  try {
    const sets = [
      'full_name=?', 'batch_year=?', 'course_profession=?', 'company=?',
      'location=?', 'bio=?', 'email=?', 'facebook_url=?',
      'is_featured=?', 'sort_order=?'
    ];
    const vals = [
      full_name, batch_year || null, course_profession || '', company || '',
      location || '', bio || '', email || '', facebook_url || '',
      is_featured === '1' || is_featured === true ? 1 : 0,
      sort_order || 0
    ];
    if (photo_url !== undefined) { sets.push('photo_url=?'); vals.push(photo_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE alumni SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: delete
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM alumni WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
