import express from 'express';
import billingController from './billing.controller.js';
import razorpayController from './razorpay.controller.js';
import auth from '../../middlewares/auth.js';
import role from '../../middlewares/role.js';

const router = express.Router();

// Middlewares for admin/superadmin access
const superadminOnly = [auth, role(['superadmin'])];

router
    .route('/stats')
    .get(superadminOnly, billingController.getStats);

router
    .route('/transactions')
    .get(superadminOnly, billingController.getTransactions);

router
    .route('/manual-invoice')
    .post(superadminOnly, billingController.createManualInvoice);

// Razorpay routes - Public for registration
router
    .route('/razorpay/create-order')
    .post(razorpayController.createSubscriptionOrder);

router
    .route('/razorpay/verify-payment')
    .post(razorpayController.verifySubscriptionPayment);

export default router;
