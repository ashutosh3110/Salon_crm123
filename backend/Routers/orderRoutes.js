const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getOrders, getCustomerOrders } = require('../Controllers/orderController');
const { protect } = require('../Middleware/auth');

router.use(protect);

router.route('/')
    .post(createOrder)
    .get(getOrders);

router.get('/me', getMyOrders);
router.get('/customer/:customerId', getCustomerOrders);
router.get('/:id', getOrderById);

module.exports = router;
