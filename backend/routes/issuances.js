const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const { type, year } = req.query;
    let q = 'SELECT * FROM issuances WHERE 1=1';
    const vals = [];
    if (type) { q += ' AND type = ?'; vals.push(type); }
    if (year) { q += ' AND school_year = ?'; vals.push(year); }
    q += ' ORDER BY date_issued DESC, id DESC';
    const [rows] = await db.query(q, vals);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateAdmin, upload.single('file'), async (req, res) => {
  const { type, title, do_number, school_year, date_issued } = req.body;
  const file_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query(
      'INSERT INTO issuances (type, title, file_url, do_number, school_year, date_issued) VALUES (?, ?, ?, ?, ?, ?)',
      [type, title, file_url, do_number, school_year, date_issued]
    );
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateAdmin, upload.single('file'), async (req, res) => {
  const { type, title, do_number, school_year, date_issued } = req.body;
  const file_url = req.file ? req.file.path : undefined;
  try {
    const sets = ['type=?','title=?','do_number=?','school_year=?','date_issued=?'];
    const vals = [type, title, do_number, school_year, date_issued];
    if (file_url) { sets.push('file_url=?'); vals.push(file_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE issuances SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM issuances WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
