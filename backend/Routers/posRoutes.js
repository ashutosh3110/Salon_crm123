const express = require('express');
const router = express.Router();
const { checkout, getInvoices, getInvoice, getDashboard, sendInvoiceWhatsApp, sendInvoiceEmail } = require('../Controllers/posController');
const { protect, authorize } = require('../Middleware/auth');
const { upload } = require('../Middleware/upload');

router.use(protect);

router.post('/checkout', checkout);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoice);
router.get('/dashboard', getDashboard);
router.post('/invoices/:id/send-whatsapp', upload.single('pdf'), sendInvoiceWhatsApp);
router.post('/invoices/:id/send-email', upload.single('pdf'), sendInvoiceEmail);

module.exports = router;
