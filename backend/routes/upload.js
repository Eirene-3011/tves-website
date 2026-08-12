const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin-only general file upload
router.post('/', authenticateAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.json({ url: req.file.path, filename: req.file.filename });
});

module.exports = router;
