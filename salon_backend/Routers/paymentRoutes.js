const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../Controllers/paymentController');
const { protect } = require('../Middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
