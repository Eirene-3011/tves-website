const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM academic_programs LIMIT 1');
    res.json(rows[0] || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/', authenticateAdmin, async (req, res) => {
  const { grade_levels_offered, special_programs, cocurricular_activities, notable_achievements } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM academic_programs LIMIT 1');
    if (existing.length) {
      await db.query('UPDATE academic_programs SET grade_levels_offered=?, special_programs=?, cocurricular_activities=?, notable_achievements=? WHERE id=?',
        [grade_levels_offered, special_programs, cocurricular_activities, notable_achievements, existing[0].id]);
    } else {
      await db.query('INSERT INTO academic_programs (grade_levels_offered, special_programs, cocurricular_activities, notable_achievements) VALUES (?, ?, ?, ?)',
        [grade_levels_offered, special_programs, cocurricular_activities, notable_achievements]);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
