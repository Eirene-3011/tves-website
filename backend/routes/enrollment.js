const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM enrollment_info LIMIT 1');
    res.json(rows[0] || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/', authenticateAdmin, async (req, res) => {
  const { schedule, requirements_richtext, process_richtext, fees_note, contact_person, contact_number, online_enrollment_link } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM enrollment_info LIMIT 1');
    if (existing.length) {
      await db.query('UPDATE enrollment_info SET schedule=?, requirements_richtext=?, process_richtext=?, fees_note=?, contact_person=?, contact_number=?, online_enrollment_link=? WHERE id=?',
        [schedule, requirements_richtext, process_richtext, fees_note, contact_person, contact_number, online_enrollment_link, existing[0].id]);
    } else {
      await db.query('INSERT INTO enrollment_info (schedule, requirements_richtext, process_richtext, fees_note, contact_person, contact_number, online_enrollment_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [schedule, requirements_richtext, process_richtext, fees_note, contact_person, contact_number, online_enrollment_link]);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
