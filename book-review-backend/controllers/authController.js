const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secret = 'your_jwt_secret';

// Đăng ký tài khoản mới + tự động đăng nhập
exports.register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing registration information' });
  }

  const hashed = bcrypt.hashSync(password, 10);

  const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(sql, [username, email, hashed, 'user'], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Username or email already exists' });
      }
      return res.status(500).json({ message: 'Registration error', error: err });
    }

    const userId = result.insertId;
    const sqlSelect = 'SELECT * FROM users WHERE id = ?';
    db.query(sqlSelect, [userId], (err2, results) => {
      if (err2 || results.length === 0) {
        return res.status(500).json({ message: 'Failed to fetch user information after registration' });
      }

      const user = results[0];
      const token = jwt.sign({
        id: user.id,
        username: user.username,
        role: user.role
      }, secret, { expiresIn: '1h' });

      // ✅ Gửi đầy đủ userId và username cho frontend
      res.status(201).json({
        message: 'Registered and logged in successfully',
        token,
        userId: user.id,
        username: user.username
      });
    });
  });
};

// Đăng nhập
exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Login error', error: err });
    if (results.length === 0) return res.status(401).json({ message: 'Incorrect username' });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role
    }, secret, { expiresIn: '12h' });

    res.json({
      message: 'Login successful',
      token,
      userId: user.id,
      username: user.username,
      role: user.role
    });
  });
};
