const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public: list published news (most recent first)
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    let sql = 'SELECT * FROM news_and_updates WHERE is_published = 1';
    const params = [];
    if (category) { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY published_date DESC, id DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: list all (published + drafts)
router.get('/all', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM news_and_updates ORDER BY published_date DESC, id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Public: get single article by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM news_and_updates WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: add
router.post('/', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { title, content, excerpt, category, published_date, is_published, sort_order } = req.body;
  const image_url = req.file ? req.file.path : null;
  try {
    const [r] = await db.query(
      `INSERT INTO news_and_updates
        (title, content, excerpt, image_url, category, published_date, is_published, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, content || '', excerpt || '', image_url,
        category || 'news',
        published_date || null,
        is_published === '1' || is_published === true ? 1 : 0,
        sort_order || 0
      ]
    );
    res.status(201).json({ id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: update
router.put('/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { title, content, excerpt, category, published_date, is_published, sort_order } = req.body;
  const image_url = req.file ? req.file.path : undefined;
  try {
    const sets = [
      'title=?', 'content=?', 'excerpt=?',
      'category=?', 'published_date=?', 'is_published=?', 'sort_order=?'
    ];
    const vals = [
      title, content || '', excerpt || '',
      category || 'news',
      published_date || null,
      is_published === '1' || is_published === true ? 1 : 0,
      sort_order || 0
    ];
    if (image_url !== undefined) { sets.push('image_url=?'); vals.push(image_url); }
    vals.push(req.params.id);
    await db.query(`UPDATE news_and_updates SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: delete
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM news_and_updates WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
