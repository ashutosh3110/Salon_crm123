const express = require('express');
const router = express.Router();
const { getSalonDashboard, getSuperAdminDashboard, getSuperAdminAnalytics, getManagerDashboard, getTeamDashboard } = require('../Controllers/dashboardController');
const { protect, authorize } = require('../Middleware/auth');

router.get('/salon', protect, authorize('admin', 'manager', 'p:dashboard'), getSalonDashboard);
router.get('/manager', protect, authorize('admin', 'manager'), getManagerDashboard);
router.get('/team', protect, authorize('admin', 'manager'), getTeamDashboard);
router.get('/superadmin', protect, authorize('superadmin'), getSuperAdminDashboard);
router.get('/superadmin/analytics', protect, authorize('superadmin'), getSuperAdminAnalytics);

module.exports = router;
