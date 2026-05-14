const express = require('express');
const router = express.Router();
const { checkout, getInvoices, getDashboard, sendInvoiceWhatsApp } = require('../Controllers/posController');
const { protect, authorize } = require('../Middleware/auth');
const { upload } = require('../Middleware/upload');

router.use(protect);

router.post('/checkout', checkout);
router.get('/invoices', getInvoices);
router.get('/dashboard', getDashboard);
router.post('/invoices/:id/send-whatsapp', upload.single('pdf'), sendInvoiceWhatsApp);

module.exports = router;
