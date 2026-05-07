const express = require('express');
const router = express.Router();
const { getBillingStats, getTransactions, createManualInvoice, updatePaymentStatus } = require('../Controllers/billingController');
const { protect, authorize } = require('../Middleware/auth');

router.get('/stats', protect, authorize('superadmin'), getBillingStats);
router.get('/transactions', protect, authorize('superadmin'), getTransactions);
router.post('/manual-invoice', protect, authorize('superadmin'), createManualInvoice);
router.put('/transactions/:id/status', protect, authorize('superadmin'), updatePaymentStatus);

module.exports = router;
