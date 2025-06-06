const db = require('../config/db');

// POST /api/popup-status → Người dùng tắt popup quảng cáo
exports.dismissPopup = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  const sql = `
    INSERT INTO cookie_popup (user_id, dismissed)
    VALUES (?, true)
    ON DUPLICATE KEY UPDATE dismissed = true, dismissed_at = NOW()
  `;

  db.query(sql, [userId], (err) => {
    if (err) {
      console.error("DB Error (dismissPopup):", err);
      return res.status(500).json({ message: 'Failed to save popup status', error: err });
    }

    res.json({ message: 'Popup dismissed recorded' });
  });
};

// GET /api/popup-status → Kiểm tra có cần hiện popup quảng cáo
exports.getPopupStatus = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  const sql = 'SELECT dismissed FROM cookie_popup WHERE user_id = ? LIMIT 1';

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("DB Error (getPopupStatus):", err);
      return res.status(500).json({ message: 'Failed to query popup status', error: err });
    }

    const dismissed = results.length > 0 ? results[0].dismissed : false;
    res.json({ showPopup: !dismissed });
  });
};

// POST /api/cookie-consent → Ghi nhận người dùng chấp nhận cookie
exports.acceptCookie = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  const sql = `
    INSERT INTO cookie_popup (user_id, accepted)
    VALUES (?, true)
    ON DUPLICATE KEY UPDATE accepted = true, accepted_at = NOW()
  `;

  db.query(sql, [userId], (err) => {
    if (err) {
      console.error("DB Error (acceptCookie):", err);
      return res.status(500).json({ message: 'Failed to save cookie consent', error: err });
    }

    res.json({ message: 'Cookie consent recorded' });
  });
};

// GET /api/cookie-consent → Kiểm tra người dùng đã chấp nhận cookie chưa
exports.getCookieStatus = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  const sql = 'SELECT accepted FROM cookie_popup WHERE user_id = ? LIMIT 1';

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("DB Error (getCookieStatus):", err);
      return res.status(500).json({ message: 'Failed to query cookie status', error: err });
    }

    const accepted = results.length > 0 ? results[0].accepted : false;
    res.json({ accepted });
  });
};
