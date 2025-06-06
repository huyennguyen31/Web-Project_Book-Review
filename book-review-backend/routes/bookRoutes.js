const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin'); // middleware kiểm tra quyền admin

// === [GET] Lấy danh sách sách mới nhất ===
router.get('/books', bookController.getBooks);

// === [GET] Chi tiết sách theo ID ===
router.get('/books/:id', bookController.getBookDetail);

// === [GET] Tìm kiếm sách theo tiêu đề ===
router.get('/books/search', bookController.searchBooks);

// === [GET] Thống kê đánh giá (rating breakdown) ===
router.get('/books/:bookId/ratings', bookController.getBookRatings);

// === [GET] Lọc sách theo thể loại (genre) ===
router.get('/books/genre/:type', bookController.getBooksByGenre);

// === [POST] Thêm sách nội bộ (Yêu cầu token) ===
router.post('/books', verifyToken, bookController.addBook);

// === [POST] Đánh giá sách (có token) ===
router.post('/books/rate', verifyToken, bookController.rateBook);

// === [POST] Nhập sách từ OpenLibrary (qua OLID) ===
router.post('/books/import-openlibrary', bookController.importFromOpenLibrary);

// === [PUT] Cập nhật sách (chỉ admin) ===
router.put('/books/:id', verifyToken, isAdmin, bookController.updateBook);

// === [DELETE] Xóa sách (chỉ admin) ===
router.delete('/books/:id', verifyToken, isAdmin, bookController.deleteBook);

module.exports = router;
