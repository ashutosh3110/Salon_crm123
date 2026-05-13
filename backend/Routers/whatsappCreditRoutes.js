const express = require('express');
const router = express.Router();
const { createCreditOrder, verifyCreditPayment, getOutletCreditLogs, superAdminUpdateCredits } = require('../Controllers/whatsappCreditController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);

router.post('/buy-credits/order', authorize('admin'), createCreditOrder);
router.post('/buy-credits/verify', authorize('admin'), verifyCreditPayment);
router.post('/superadmin/update', authorize('superadmin'), superAdminUpdateCredits);
router.get('/credits/logs', authorize('admin', 'superadmin'), getOutletCreditLogs);

module.exports = router;
