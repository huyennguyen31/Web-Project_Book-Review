const db = require('../config/db');

// ✅ Thêm bình luận và cập nhật lại rating sách
exports.addComment = (req, res) => {
  const { bookId, userId, content, rating } = req.body;

  const sql = 'INSERT INTO comments (book_id, user_id, content, rating) VALUES (?, ?, ?, ?)';
  db.query(sql, [bookId, userId, content, rating], (err) => {
    if (err) return res.status(500).json({ message: 'Error while adding comment' });

    // ✅ Sau khi thêm xong, cập nhật lại bảng books với thông tin rating
    const updateSql = `
      UPDATE books b
      JOIN (
        SELECT book_id, COUNT(rating) AS rating_count, SUM(rating) AS rating_sum, ROUND(AVG(rating), 2) AS rating
        FROM comments
        WHERE rating IS NOT NULL AND book_id = ?
        GROUP BY book_id
      ) c ON b.id = c.book_id
      SET b.rating = c.rating, b.rating_count = c.rating_count, b.rating_sum = c.rating_sum
    `;

    db.query(updateSql, [bookId], (err2) => {
      if (err2) return res.status(500).json({ message: 'Error updating book rating', error: err2 });
      res.json({ message: 'Comment added and rating updated successfully' });
    });
  });
};

// ✅ Lấy danh sách bình luận theo sách
exports.getComments = (req, res) => {
  const bookId = req.params.bookId;

  const sql = `
    SELECT comments.*, users.username 
    FROM comments 
    JOIN users ON comments.user_id = users.id
    WHERE book_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [bookId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error retrieving comments' });
    res.json(results);
  });
};
