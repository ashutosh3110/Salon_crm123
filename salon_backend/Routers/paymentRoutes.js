const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    verifyPayment, 
    createWalletOrder, 
    verifyWalletPayment 
} = require('../Controllers/paymentController');
const { protect } = require('../Middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/create-wallet-order', protect, createWalletOrder);
router.post('/verify-wallet-payment', protect, verifyWalletPayment);

module.exports = router;
