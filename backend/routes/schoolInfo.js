const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM school_info LIMIT 1');
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const fields = req.body;
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ error: 'No fields provided.' });
    const sets = keys.map(k => `\`${k}\` = ?`).join(', ');
    const vals = keys.map(k => fields[k]);
    await db.query(`UPDATE school_info SET ${sets} WHERE id = 1`, vals);
    const [rows] = await db.query('SELECT * FROM school_info LIMIT 1');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
