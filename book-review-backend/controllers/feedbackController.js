const db = require('../config/db');

function isValidEmail(email) {
  if (!email) return true; // Nếu email không bắt buộc, bỏ qua check
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

exports.submitFeedback = (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !message) return res.status(400).json({ message: 'Missing required fields' });

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  const sql = 'INSERT INTO feedbacks (name, email, message) VALUES (?, ?, ?)';
  db.query(sql, [name, email, message], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to save feedback', error: err });
    res.status(201).json({ message: 'Feedback submitted successfully' });
  });
};

exports.getAllFeedbacks = (req, res) => {
  const sql = 'SELECT * FROM feedbacks ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to retrieve feedback list' });
    res.json(results);
  });
};
