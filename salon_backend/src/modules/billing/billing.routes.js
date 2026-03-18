import express from 'express';
import billingController from './billing.controller.js';
import auth from '../../middlewares/auth.js';
import role from '../../middlewares/role.js';

const router = express.Router();

// All routes require superadmin role
router.use(auth);
router.use(role(['superadmin']));

router
    .route('/stats')
    .get(billingController.getStats);

router
    .route('/transactions')
    .get(billingController.getTransactions);

router
    .route('/manual-invoice')
    .post(billingController.createManualInvoice);

export default router;
