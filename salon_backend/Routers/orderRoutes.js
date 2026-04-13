const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../Controllers/orderController');
const { protect } = require('../Middleware/auth');

router.use(protect);

router.route('/')
    .post(createOrder);

router.get('/me', getMyOrders);

module.exports = router;
