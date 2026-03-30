import express from 'express';
import loyaltyController from './loyalty.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { loyaltyValidation } from '../../validations/index.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

// Membership Purchases (Moved Up for better visibility)
router.post('/membership/order', authorize(['customer']), loyaltyController.createMembershipOrder);
router.post('/membership/verify', authorize(['customer']), loyaltyController.verifyMembershipPayment);
router.get('/membership/active', authorize(['customer']), loyaltyController.getActiveMembership);

router.get('/wallet/:customerId', loyaltyController.getWallet);
router.get('/history/:customerId', loyaltyController.getHistory);
router.get('/rules', authorize(['admin', 'manager', 'customer']), loyaltyController.getRules);
router.post('/rules', authorize(['admin']), validate(loyaltyValidation.setupRules), loyaltyController.setupRules);
router.put('/rules', authorize(['admin']), validate(loyaltyValidation.setupRules), loyaltyController.setupRules);
router.get('/membership-plans', authorize(['admin', 'manager', 'customer']), loyaltyController.listMembershipPlans);
router.post('/membership-plans', authorize(['admin', 'manager']), loyaltyController.createMembershipPlan);
router.patch('/membership-plans/:planId', authorize(['admin', 'manager']), loyaltyController.updateMembershipPlan);
router.delete('/membership-plans/:planId', authorize(['admin', 'manager']), loyaltyController.deleteMembershipPlan);
router.get('/members', authorize(['admin', 'manager']), loyaltyController.listMembers);
router.get('/transactions', authorize(['admin', 'manager']), loyaltyController.listTransactions);
router.get('/referral-settings', authorize(['admin', 'manager', 'customer']), loyaltyController.getReferralSettings);
router.get('/referrals/me', authorize(['customer']), loyaltyController.getMyReferrals);
router.put(
    '/referral-settings',
    authorize(['admin', 'manager']),
    validate(loyaltyValidation.updateReferralSettings),
    loyaltyController.updateReferralSettings
);
router.post(
    '/credit',
    authorize(['admin', 'manager', 'customer']),
    validate(loyaltyValidation.walletCredit),
    loyaltyController.creditWallet
);
router.post(
    '/debit',
    authorize(['admin', 'manager']),
    validate(loyaltyValidation.walletDebit),
    loyaltyController.debitWallet
);
router.post('/refer', validate(loyaltyValidation.refer), loyaltyController.referCustomer);

router.post('/refer', validate(loyaltyValidation.refer), loyaltyController.referCustomer);

export default router;
