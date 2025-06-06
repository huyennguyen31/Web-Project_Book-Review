const db = require('../config/db');

// [1] Lấy tổng số lượt truy cập từ bảng site_views
exports.getSiteStats = (req, res) => {
  const sql = "SELECT COUNT(*) AS totalViews FROM site_views";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error querying site views:", err);
      return res.status(500).json({ error: "Server error while querying view count" });
    }
    res.json({ totalViews: results[0].totalViews });
  });
};

// [2] Lấy tất cả bình luận cùng tên sách và người dùng
exports.getAllComments = (req, res) => {
  const sql = `
    SELECT 
      comments.id, 
      comments.content, 
      comments.rating, 
      comments.created_at, 
      users.username, 
      books.title AS book_title
    FROM comments
    JOIN users ON comments.user_id = users.id
    JOIN books ON comments.book_id = books.id
    ORDER BY comments.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error querying comments:", err);
      return res.status(500).json({ error: "Failed to retrieve comment list" });
    }
    res.json(results);
  });
};

// [3] Xóa bình luận theo ID
exports.deleteComment = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM comments WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting comment:", err);
      return res.status(500).json({ error: "Failed to delete comment" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No comment found to delete" });
    }
    res.json({ message: "Deleted successfully" });
  });
};

// [4] Cập nhật quyền người dùng (chuyển giữa user/admin)
exports.promoteUser = (req, res) => {
  const id = req.params.id;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role (must be either user or admin)' });
  }

  const sql = "UPDATE users SET role = ? WHERE id = ?";
  db.query(sql, [role, id], (err, result) => {
    if (err) {
      console.error("Error updating role:", err);
      return res.status(500).json({ error: "Failed to update user role" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found to update" });
    }
    res.json({ message: `Role updated successfully: ${role}` });
  });
};

// Lấy nội dung About/Contact/Footer
exports.getPageContent = (req, res) => {
  const sql = "SELECT about, contact, footer FROM page_content WHERE id = 1";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch content', error: err });
    res.json(results[0] || {});
  });
};

// Cập nhật nội dung
exports.updatePageContent = (req, res) => {
  const { about, contact, footer } = req.body;
  const sql = "UPDATE page_content SET about = ?, contact = ?, footer = ? WHERE id = 1";
  db.query(sql, [about, contact, footer], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to update content', error: err });
    res.json({ message: 'Content updated successfully' });
  });
};
