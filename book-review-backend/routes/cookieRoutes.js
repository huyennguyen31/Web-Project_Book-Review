const express = require('express');
const router = express.Router();
const cookieController = require('../controllers/cookieController');
const verifyToken = require('../middlewares/verifyToken');

// Ghi nhận đồng ý cookie
router.post('/cookie-consent', verifyToken, cookieController.acceptCookie);
router.get('/cookie-consent', verifyToken, cookieController.getCookieStatus);

// Ghi nhận tắt popup quảng cáo
router.post('/popup-status', verifyToken, cookieController.dismissPopup);
router.get('/popup-status', verifyToken, cookieController.getPopupStatus);

module.exports = router;
