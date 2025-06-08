const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const adminController = require('../controllers/adminController');
const db = require('../config/db');

// =============================
// [1] Thống kê website
// =============================
router.get('/stats', verifyToken, isAdmin, adminController.getSiteStats);

// =============================
// [2] Danh sách người dùng
// =============================
router.get('/users', verifyToken, isAdmin, (req, res) => {
  const sql = `
    SELECT id, username, email, role, status, created_at 
    FROM users 
    ORDER BY created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch users', error: err });
    res.json(results);
  });
});

// [3] Xóa người dùng
router.delete('/users/:id', verifyToken, isAdmin, (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to delete user', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found to delete' });
    res.json({ message: 'User deleted successfully' });
  });
});

// [4] Cập nhật vai trò user (user/admin)
router.put('/users/:id/role', verifyToken, isAdmin, adminController.promoteUser);

// [5] Cập nhật trạng thái người dùng (active/locked)
router.put('/users/:id/status', verifyToken, isAdmin, (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;

  if (!['active', 'locked'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status (only active or locked allowed)' });
  }

  db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to update user status', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found to update' });
    res.json({ message: `User status updated to '${status}'` });
  });
});

// =============================
// Bình luận người dùng
// =============================

// [6] Lấy toàn bộ bình luận
router.get('/comments', verifyToken, isAdmin, adminController.getAllComments);

// [7] Lấy bình luận theo user
router.get('/users/:id/comments', verifyToken, isAdmin, (req, res) => {
  const userId = req.params.id;
  const sql = `
    SELECT comments.id, books.title AS book_title, comments.content, comments.rating, comments.created_at
    FROM comments
    JOIN books ON comments.book_id = books.id
    WHERE comments.user_id = ?
    ORDER BY comments.created_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch comments by user', error: err });
    res.json(results);
  });
});

// [8] Xóa bình luận theo ID
router.delete('/comments/:id', verifyToken, isAdmin, adminController.deleteComment);

// [9] Lấy và cập nhật nội dung About/Contact/Footer
router.get('/page-content', adminController.getPageContent);
router.put('/page-content', verifyToken, isAdmin, adminController.updatePageContent);

module.exports = router;

