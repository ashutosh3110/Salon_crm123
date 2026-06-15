const express = require('express');
const router = express.Router();
const { getWalletDetails, createTopupOrder, verifyTopup, bulkRecharge, getCustomerWallet, getCustomerTransactions, directTopup, transferWalletBalance } = require('../Controllers/walletController');
const { protect } = require('../Middleware/auth');

router.use(protect);

router.get('/', getWalletDetails);
router.get('/customer/:customerId', getCustomerWallet);
router.get('/transactions/customer/:customerId', getCustomerTransactions);
router.post('/topup/order', createTopupOrder);
router.post('/topup/verify', verifyTopup);
router.post('/topup/direct', directTopup);
router.post('/bulk-recharge', bulkRecharge);
router.post('/transfer', transferWalletBalance);

module.exports = router;
