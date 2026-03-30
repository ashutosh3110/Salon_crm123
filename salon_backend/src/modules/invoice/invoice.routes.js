import express from 'express';
import invoiceController from './invoice.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router.get('/', invoiceController.getInvoices);
router.get('/stats', invoiceController.getDashboardStats);
router.get('/refunds', invoiceController.getRefunds);
router.get('/finance-dashboard', invoiceController.getFinanceDashboard);
router.patch('/:invoiceId/refund-action', invoiceController.processRefundAction);
router.patch('/:invoiceId/settle', invoiceController.settleInvoice);
router.get('/:invoiceId', invoiceController.getInvoice);

export default router;
