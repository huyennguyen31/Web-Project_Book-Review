const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const verifyToken = require('../middlewares/verifyToken');  // middleware xác thực JWT
const isAdmin = require('../middlewares/isAdmin');          // middleware kiểm tra quyền admin

// Route gửi feedback - ai cũng có thể gửi
router.post('/feedback', feedbackController.submitFeedback);

// Route lấy tất cả feedbacks - chỉ admin mới được xem
router.get('/admin/feedbacks', verifyToken, isAdmin, feedbackController.getAllFeedbacks);

module.exports = router;
