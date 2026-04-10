const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings
} = require('../Controllers/settingController');
const { protect, authorize } = require('../Middleware/auth');

router.route('/')
    .get(getSettings)
    .patch(protect, authorize('superadmin'), updateSettings);

module.exports = router;
