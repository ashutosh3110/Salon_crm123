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
    .route('/my-transactions')
    .get(auth, role(['admin', 'manager', 'accountant', 'superadmin']), billingController.getMyTransactions);

router
    .route('/manual-invoice')
    .post(superadminOnly, billingController.createManualInvoice);

import optionalAuth from '../../middlewares/optionalAuth.js';

import webhookController from './webhook.controller.js';

// Razorpay routes - Public for registration, Optionally authenticated for upgrade
router
    .route('/razorpay/webhook')
    .post(webhookController.handleWebhook);

router
    .route('/razorpay/create-order')
    .post(optionalAuth, razorpayController.createSubscriptionOrder);

// Razorpay order for wallet recharge (admin-triggered)
router
    .route('/razorpay/create-wallet-order')
    .post(auth, razorpayController.createWalletRechargeOrder);

router
    .route('/razorpay/verify-payment')
    .post(optionalAuth, razorpayController.verifySubscriptionPayment);

export default router;
