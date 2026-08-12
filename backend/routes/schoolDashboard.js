const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────
// Public: GET /api/school-dashboard
// Returns all dashboard stats + grade-level breakdown
// ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM school_dashboard LIMIT 1');
    const [grades] = await db.query(
      'SELECT * FROM school_dashboard_grades ORDER BY sort_order, grade_level'
    );
    res.json({ stats: rows[0] || {}, grades });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Admin: PUT /api/school-dashboard/stats
// Upserts the single-row school_dashboard record with ALL fields.
// ─────────────────────────────────────────────────────────────
router.put('/stats', authenticateAdmin, async (req, res) => {
  const {
    // Overview
    active_school_year,
    enrollment_status,
    enrollment_count,
    performance_indicator,
    // Human Resources
    teaching_personnel,
    non_teaching_personnel,
    administrative_staff,
    vacant_positions,
    // Access
    male_count,
    female_count,
    retention_rate,
    dropout_rate,
    transition_completion_rate,
    // Quality
    overall_proficiency,
    english_readers,
    filipino_readers,
    math_numeracy,
    science_literacy,
    // Equity
    learners_with_disabilities,
    disadvantaged_learners,
    // Well-Being
    bmi_normal,
    bmi_overweight,
    bmi_obese,
    bmi_wasted,
    health_assessment_done,
    child_protection_cases,
    // School Governance
    sbm_level,
    opcrf_rating,
    classroom_ratio,
    teacher_ratio,
    seat_ratio,
    internet_speed,
    functional_facilities_count,
    total_facilities_count,
    // Agency Accountabilities
    acc_transparency_seal,
    acc_aip_wfp_app,
    acc_saln,
    acc_philgeps,
    acc_coa_aom,
    acc_foi,
    acc_arta,
    acc_ccsr_csm,
    acc_8888_ccb,
    digitalization_status,
  } = req.body;

  const fields = {
    active_school_year: active_school_year || '',
    enrollment_status: enrollment_status || 'Open',
    enrollment_count: enrollment_count || 0,
    performance_indicator: performance_indicator || '',
    teaching_personnel: teaching_personnel || 0,
    non_teaching_personnel: non_teaching_personnel || 0,
    administrative_staff: administrative_staff || 0,
    vacant_positions: vacant_positions || 0,
    male_count: male_count || 0,
    female_count: female_count || 0,
    retention_rate: retention_rate || 0,
    dropout_rate: dropout_rate || 0,
    transition_completion_rate: transition_completion_rate || 0,
    overall_proficiency: overall_proficiency || 0,
    english_readers: english_readers || 0,
    filipino_readers: filipino_readers || 0,
    math_numeracy: math_numeracy || 0,
    science_literacy: science_literacy || 0,
    learners_with_disabilities: learners_with_disabilities || 0,
    disadvantaged_learners: disadvantaged_learners || 0,
    bmi_normal: bmi_normal || 0,
    bmi_overweight: bmi_overweight || 0,
    bmi_obese: bmi_obese || 0,
    bmi_wasted: bmi_wasted || 0,
    health_assessment_done: health_assessment_done || 0,
    child_protection_cases: child_protection_cases || 0,
    sbm_level: sbm_level || '',
    opcrf_rating: opcrf_rating || 0,
    classroom_ratio: classroom_ratio || '',
    teacher_ratio: teacher_ratio || '',
    seat_ratio: seat_ratio || '',
    internet_speed: internet_speed || '',
    functional_facilities_count: functional_facilities_count || 0,
    total_facilities_count: total_facilities_count || 0,
    acc_transparency_seal: acc_transparency_seal || 'Pending',
    acc_aip_wfp_app: acc_aip_wfp_app || 'Pending',
    acc_saln: acc_saln || 'Pending',
    acc_philgeps: acc_philgeps || 'Pending',
    acc_coa_aom: acc_coa_aom || 'Pending',
    acc_foi: acc_foi || 'Pending',
    acc_arta: acc_arta || 'Pending',
    acc_ccsr_csm: acc_ccsr_csm || 'Pending',
    acc_8888_ccb: acc_8888_ccb || 'Pending',
    digitalization_status: digitalization_status || 'In Progress',
  };

  const columns = Object.keys(fields);
  const values = Object.values(fields);

  try {
    const [existing] = await db.query('SELECT id FROM school_dashboard LIMIT 1');
    if (existing.length) {
      const setClause = columns.map(c => `${c}=?`).join(', ');
      await db.query(
        `UPDATE school_dashboard SET ${setClause} WHERE id=?`,
        [...values, existing[0].id]
      );
    } else {
      const colList = columns.join(', ');
      const placeholders = columns.map(() => '?').join(', ');
      await db.query(
        `INSERT INTO school_dashboard (${colList}) VALUES (${placeholders})`,
        values
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Admin: PUT /api/school-dashboard/grades/:gradeLevel
// Upserts a single grade-level row (sections, classrooms, M/F counts)
// ─────────────────────────────────────────────────────────────
router.put('/grades/:gradeLevel', authenticateAdmin, async (req, res) => {
  const { sections_count, classrooms_count, male_count, female_count, sort_order } = req.body;
  const gradeLevel = req.params.gradeLevel;
  try {
    const [existing] = await db.query(
      'SELECT id FROM school_dashboard_grades WHERE grade_level=?',
      [gradeLevel]
    );
    if (existing.length) {
      await db.query(
        'UPDATE school_dashboard_grades SET sections_count=?, classrooms_count=?, male_count=?, female_count=?, sort_order=? WHERE grade_level=?',
        [
          sections_count || 0,
          classrooms_count || 0,
          male_count || 0,
          female_count || 0,
          sort_order || 0,
          gradeLevel,
        ]
      );
    } else {
      await db.query(
        'INSERT INTO school_dashboard_grades (grade_level, sections_count, classrooms_count, male_count, female_count, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [gradeLevel, sections_count || 0, classrooms_count || 0, male_count || 0, female_count || 0, sort_order || 0]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
