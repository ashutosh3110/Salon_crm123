const express = require('express');
const router = express.Router();
const {
    getLoyaltySettings,
    updateLoyaltySettings,
    getLoyaltyHistory,
    getPublicLoyaltySettings,
    redeemLoyaltyPoints,
    getReferralSettings,
    getMyReferrals,
    getLoyaltyMembers,
    getAdminLoyaltyTransactions,
    getMembershipReminders,
    sendManualMembershipReminder,
    updateLoyaltyMember,
    deleteLoyaltyMember
} = require('../Controllers/loyaltyController');
const {
    getMembershipPlans,
    getMembershipPlan,
    createMembershipPlan,
    updateMembershipPlan,
    deleteMembershipPlan,
    createMembershipOrder,
    verifyMembershipPayment,
    getActiveMembership,
    buyMembershipWithWallet,
    assignMembershipDirect
} = require('../Controllers/membershipPlanController');

const { protect, authorize } = require('../Middleware/auth');

// Public routes
router.get('/membership-plans/public', getMembershipPlans);
router.get('/settings/public', getPublicLoyaltySettings);

// Protected routes
router.use(protect);

router
    .route('/membership-plans')
    .get(getMembershipPlans)
    .post(authorize('admin', 'manager', 'p:loyalty'), createMembershipPlan);

router
    .route('/membership-plans/:id')
    .get(getMembershipPlan)
    .patch(authorize('admin', 'manager', 'p:loyalty'), updateMembershipPlan)
    .delete(authorize('admin', 'manager', 'p:loyalty'), deleteMembershipPlan);

router
    .route('/settings')
    .get(authorize('admin', 'manager', 'customer', 'superadmin', 'p:loyalty'), getLoyaltySettings)
    .put(authorize('superadmin'), updateLoyaltySettings);

router.get('/rules', authorize('admin', 'manager', 'customer', 'superadmin', 'p:loyalty'), getLoyaltySettings);

router.get('/history', getLoyaltyHistory);
router.post('/redeem', redeemLoyaltyPoints);

router.get('/membership/active', getActiveMembership);
router.post('/membership/order', createMembershipOrder);
router.post('/membership/verify', verifyMembershipPayment);
router.post('/membership/wallet-pay', buyMembershipWithWallet);
router.post('/membership/assign', authorize('admin', 'manager', 'p:loyalty'), assignMembershipDirect);

router.get('/referral-settings', getReferralSettings);
router.get('/referrals/me', getMyReferrals);
router.get('/transactions/me', getLoyaltyHistory);
router.get('/members', authorize('admin', 'manager', 'p:loyalty'), getLoyaltyMembers);
router.route('/members/:id')
    .patch(authorize('admin', 'manager', 'p:loyalty'), updateLoyaltyMember)
    .delete(authorize('admin', 'manager', 'p:loyalty'), deleteLoyaltyMember);
router.get('/transactions', authorize('admin', 'manager', 'p:loyalty'), getAdminLoyaltyTransactions);
router.get('/reminders', authorize('admin', 'manager', 'p:loyalty'), getMembershipReminders);
router.post('/reminders/:id/send', authorize('admin', 'manager', 'p:loyalty'), sendManualMembershipReminder);

module.exports = router;
