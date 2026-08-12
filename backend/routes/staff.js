const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM staff_directory ORDER BY sort_order, full_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM staff_directory WHERE id = ?', [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateAdmin, upload.single('photo'), async (req, res) => {
  const { full_name, position_subject, section_name, department_grade_level, years_in_service, contact_no, sort_order } = req.body;
  const photo_url = req.file ? req.file.path : null;
  try {
    const [result] = await db.query(
      `INSERT INTO staff_directory (full_name, position_subject, section_name, department_grade_level, years_in_service, contact_no, photo_url, photo_match_status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, position_subject, section_name, department_grade_level, years_in_service || 0, contact_no, photo_url, photo_url ? 'matched' : 'unmatched', sort_order || 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateAdmin, upload.single('photo'), async (req, res) => {
  const { full_name, position_subject, section_name, department_grade_level, years_in_service, contact_no, sort_order, photo_match_status } = req.body;
  const photo_url = req.file ? req.file.path : undefined;
  try {
    const sets = ['full_name = ?', 'position_subject = ?', 'section_name = ?', 'department_grade_level = ?', 'years_in_service = ?', 'contact_no = ?', 'sort_order = ?'];
    const vals = [full_name, position_subject, section_name, department_grade_level, years_in_service || 0, contact_no, sort_order || 0];
    if (photo_url) { sets.push('photo_url = ?', 'photo_match_status = ?'); vals.push(photo_url, 'matched'); }
    else if (photo_match_status) { sets.push('photo_match_status = ?'); vals.push(photo_match_status); }
    vals.push(req.params.id);
    await db.query(`UPDATE staff_directory SET ${sets.join(', ')} WHERE id = ?`, vals);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM staff_directory WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
