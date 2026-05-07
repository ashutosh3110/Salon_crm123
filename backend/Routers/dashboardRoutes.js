const express = require('express');
const router = express.Router();
const { getSalonDashboard, getSuperAdminDashboard, getSuperAdminAnalytics } = require('../Controllers/dashboardController');
const { protect, authorize } = require('../Middleware/auth');

router.get('/salon', protect, authorize('admin', 'manager', 'p:dashboard'), getSalonDashboard);
router.get('/superadmin', protect, authorize('superadmin'), getSuperAdminDashboard);
router.get('/superadmin/analytics', protect, authorize('superadmin'), getSuperAdminAnalytics);

module.exports = router;
