const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');

// Public: submit contact message
router.post('/', async (req, res) => {
  const { sender_name, sender_email, subject, message } = req.body;
  if (!sender_name || !message) return res.status(400).json({ error: 'Name and message are required.' });
  try {
    const [r] = await db.query('INSERT INTO contact_messages (sender_name, sender_email, subject, message) VALUES (?, ?, ?, ?)',
      [sender_name, sender_email, subject, message]);
    res.status(201).json({ success: true, id: r.insertId, message: 'Your message has been sent. Thank you!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: get messages
router.get('/messages', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY submitted_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: mark as read
router.put('/messages/:id/read', authenticateAdmin, async (req, res) => {
  try {
    await db.query('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: delete
router.delete('/messages/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
