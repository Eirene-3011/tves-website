const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public: list all charter documents
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM charter_documents ORDER BY sort_order, id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: get single document
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM charter_documents WHERE id = ?', [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: add a new charter document
router.post('/', authenticateAdmin, upload.single('pdf'), async (req, res) => {
  const { title, description, sort_order } = req.body;
  const pdf_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query(
      'INSERT INTO charter_documents (title, description, pdf_url, sort_order) VALUES (?, ?, ?, ?)',
      [title, description || '', pdf_url, sort_order || 0]
    );
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: update a charter document
router.put('/:id', authenticateAdmin, upload.single('pdf'), async (req, res) => {
  const { title, description, sort_order } = req.body;
  const pdf_url = req.file ? req.file.path : undefined;
  try {
    const sets = ['title=?', 'description=?', 'sort_order=?'];
    const vals = [title, description || '', sort_order || 0];
    if (pdf_url) { sets.push('pdf_url=?'); vals.push(pdf_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE charter_documents SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: delete a charter document
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM charter_documents WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
