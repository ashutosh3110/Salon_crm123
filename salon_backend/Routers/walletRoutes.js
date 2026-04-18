const express = require('express');
const router = express.Router();
const { getWalletDetails, createTopupOrder, verifyTopup, bulkRecharge } = require('../Controllers/walletController');
const { protect } = require('../Middleware/auth');

router.use(protect);

router.get('/', getWalletDetails);
router.post('/topup/order', createTopupOrder);
router.post('/topup/verify', verifyTopup);
router.post('/bulk-recharge', bulkRecharge);

module.exports = router;
