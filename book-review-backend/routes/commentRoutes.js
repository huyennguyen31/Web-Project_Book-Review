// commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// === API: Thêm bình luận cho sách ===
router.post('/comments', commentController.addComment);

// === API: Lấy danh sách bình luận của 1 cuốn sách ===
router.get('/comments/:bookId', commentController.getComments);

module.exports = router;
