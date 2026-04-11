const express = require('express');
const router = express.Router();
const {
    getLoyaltySettings,
    updateLoyaltySettings,
    getLoyaltyHistory
} = require('../Controllers/loyaltyController');
const { protect, authorize } = require('../Middleware/auth');

// Public route for membership plans
router.get('/membership-plans', (req, res) => {
    res.json({ success: true, data: [] });
});

// Protected routes
router.use(protect);

router
    .route('/settings')
    .get(authorize('admin', 'manager'), getLoyaltySettings)
    .put(authorize('admin', 'manager'), updateLoyaltySettings);

router.get('/history', getLoyaltyHistory);

router.get('/referral-settings', (req, res) => {
    res.json({ success: true, data: { referrerReward: 200 } });
});

module.exports = router;
