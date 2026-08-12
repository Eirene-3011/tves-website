const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM org_chart LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateAdmin, upload.single('image'), async (req, res) => {
  const image_url = req.file ? req.file.path : req.body.image_url;
  try {
    await db.query('DELETE FROM org_chart');
    const [r] = await db.query('INSERT INTO org_chart (image_url) VALUES (?)', [image_url]);
    res.json({ id: r.insertId, image_url });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
