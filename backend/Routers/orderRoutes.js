const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getMyOrders, 
    getOrderById, 
    getOrders, 
    getCustomerOrders, 
    updateOrderStatus,
    cancelOrder
} = require('../Controllers/orderController');
const { protect } = require('../Middleware/auth');

router.use(protect);

router.route('/')
    .post(createOrder)
    .get(getOrders);

router.patch('/:id/status', updateOrderStatus);
router.post('/:id/cancel', cancelOrder);
router.get('/me', getMyOrders);
router.get('/customer/:customerId', getCustomerOrders);
router.get('/:id', getOrderById);

module.exports = router;
