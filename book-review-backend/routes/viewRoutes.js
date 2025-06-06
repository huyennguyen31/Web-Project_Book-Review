const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ghi một lượt truy cập kèm IP
router.post('/site-view', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const sql = "INSERT INTO site_views (ip_address) VALUES (?)";

  db.query(sql, [ip], (err) => {
    if (err) {
      console.error("❌ Failed to record view:", err);
      return res.status(500).json({ message: 'Failed to log view' });
    }
    res.json({ message: '✅ View recorded', ip });
  });
});

module.exports = router;
