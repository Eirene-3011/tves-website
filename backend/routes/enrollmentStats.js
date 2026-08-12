const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const COLS = [
  'school_year', 'sort_order', 'chart_image_url',
  'kinder_male', 'kinder_female',
  'grade1_male', 'grade1_female',
  'grade2_male', 'grade2_female',
  'grade3_male', 'grade3_female',
  'grade4_male', 'grade4_female',
  'grade5_male', 'grade5_female',
  'grade6_male', 'grade6_female',
];

function totals(row) {
  const levels = ['kinder','grade1','grade2','grade3','grade4','grade5','grade6'];
  let total_male = 0, total_female = 0;
  levels.forEach(l => {
    total_male   += Number(row[`${l}_male`]   || 0);
    total_female += Number(row[`${l}_female`] || 0);
  });
  return { ...row, total_male, total_female, grand_total: total_male + total_female };
}

// GET all school years (newest first by sort_order DESC)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM enrollment_stats ORDER BY sort_order DESC');
    res.json(rows.map(totals));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single year
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM enrollment_stats WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(totals(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create
router.post('/', authenticateAdmin, upload.single('chart_image'), async (req, res) => {
  const b = req.body;
  const chart_image_url = req.file ? req.file.path : null;
  try {
    const [result] = await db.query(
      `INSERT INTO enrollment_stats
         (school_year, sort_order, chart_image_url,
          kinder_male, kinder_female, grade1_male, grade1_female,
          grade2_male, grade2_female, grade3_male, grade3_female,
          grade4_male, grade4_female, grade5_male, grade5_female,
          grade6_male, grade6_female)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.school_year, b.sort_order || 0, chart_image_url,
        b.kinder_male||0, b.kinder_female||0,
        b.grade1_male||0, b.grade1_female||0,
        b.grade2_male||0, b.grade2_female||0,
        b.grade3_male||0, b.grade3_female||0,
        b.grade4_male||0, b.grade4_female||0,
        b.grade5_male||0, b.grade5_female||0,
        b.grade6_male||0, b.grade6_female||0,
      ]
    );
    res.json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update
router.put('/:id', authenticateAdmin, upload.single('chart_image'), async (req, res) => {
  const b = req.body;
  // Keep existing image if no new file uploaded and no explicit clear
  const chart_image_url = req.file ? req.file.path : (b.chart_image_url || null);
  try {
    await db.query(
      `UPDATE enrollment_stats SET
         school_year=?, sort_order=?, chart_image_url=?,
         kinder_male=?, kinder_female=?, grade1_male=?, grade1_female=?,
         grade2_male=?, grade2_female=?, grade3_male=?, grade3_female=?,
         grade4_male=?, grade4_female=?, grade5_male=?, grade5_female=?,
         grade6_male=?, grade6_female=?
       WHERE id=?`,
      [
        b.school_year, b.sort_order||0, chart_image_url,
        b.kinder_male||0, b.kinder_female||0,
        b.grade1_male||0, b.grade1_female||0,
        b.grade2_male||0, b.grade2_female||0,
        b.grade3_male||0, b.grade3_female||0,
        b.grade4_male||0, b.grade4_female||0,
        b.grade5_male||0, b.grade5_female||0,
        b.grade6_male||0, b.grade6_female||0,
        req.params.id,
      ]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM enrollment_stats WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;