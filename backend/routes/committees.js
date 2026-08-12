const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const [committees] = await db.query('SELECT * FROM committees ORDER BY sort_order');
    const [members] = await db.query('SELECT * FROM committee_members ORDER BY id');
    const result = committees.map(c => ({
      ...c,
      members: members.filter(m => m.committee_id === c.id)
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateAdmin, upload.single('file'), async (req, res) => {
  const { committee_name, description, sort_order } = req.body;
  const file_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query('INSERT INTO committees (committee_name, description, file_url, sort_order) VALUES (?, ?, ?, ?)',
      [committee_name, description, file_url, sort_order || 0]);
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateAdmin, upload.single('file'), async (req, res) => {
  const { committee_name, description, sort_order } = req.body;
  const file_url = req.file ? req.file.path : undefined;
  try {
    const sets = ['committee_name=?','description=?','sort_order=?'];
    const vals = [committee_name, description, sort_order || 0];
    if (file_url) { sets.push('file_url=?'); vals.push(file_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE committees SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM committees WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Members — POST supports photo upload + optional section_name/adviser_name
router.post('/:committeeId/members', authenticateAdmin, upload.single('photo'), async (req, res) => {
  const { full_name, role, contact_no, section_name, adviser_name } = req.body;
  const photo_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query(
      'INSERT INTO committee_members (committee_id, full_name, role, section_name, adviser_name, contact_no, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.params.committeeId, full_name, role, section_name || null, adviser_name || null, contact_no, photo_url]
    );
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/members/:id', authenticateAdmin, upload.single('photo'), async (req, res) => {
  const { full_name, role, contact_no, section_name, adviser_name } = req.body;
  const photo_url = req.file ? req.file.path : undefined;
  try {
    const sets = ['full_name=?', 'role=?', 'contact_no=?', 'section_name=?', 'adviser_name=?'];
    const vals = [full_name, role, contact_no, section_name || null, adviser_name || null];
    if (photo_url) { sets.push('photo_url=?'); vals.push(photo_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE committee_members SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/members/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM committee_members WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
