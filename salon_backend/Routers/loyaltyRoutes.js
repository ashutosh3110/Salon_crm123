const express = require('express');
const router = express.Router();
const {
    getLoyaltySettings,
    updateLoyaltySettings,
    getLoyaltyHistory,
    getPublicLoyaltySettings
} = require('../Controllers/loyaltyController');
const {
    getMembershipPlans,
    getMembershipPlan,
    createMembershipPlan,
    updateMembershipPlan,
    deleteMembershipPlan
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
    .post(authorize('admin', 'manager'), createMembershipPlan);

router
    .route('/membership-plans/:id')
    .get(getMembershipPlan)
    .patch(authorize('admin', 'manager'), updateMembershipPlan)
    .delete(authorize('admin', 'manager'), deleteMembershipPlan);

router
    .route('/settings')
    .get(authorize('admin', 'manager', 'customer'), getLoyaltySettings)
    .put(authorize('admin', 'manager'), updateLoyaltySettings);

router.get('/rules', authorize('admin', 'manager', 'customer'), getLoyaltySettings);

router.get('/history', getLoyaltyHistory);

router.get('/referral-settings', (req, res) => {
    res.json({ success: true, data: { referrerReward: 200 } });
});

module.exports = router;
