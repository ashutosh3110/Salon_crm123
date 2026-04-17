const express = require('express');
const router = express.Router();
const { getSalonDashboard, getSuperAdminDashboard } = require('../Controllers/dashboardController');
const { protect, authorize } = require('../Middleware/auth');

router.get('/salon', protect, authorize('admin'), getSalonDashboard);
router.get('/superadmin', protect, authorize('superadmin'), getSuperAdminDashboard);

module.exports = router;
