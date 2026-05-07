const express = require('express');
const router = express.Router();
const { checkout, getInvoices } = require('../Controllers/posController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);

router.post('/checkout', checkout);
router.get('/invoices', getInvoices);

module.exports = router;
