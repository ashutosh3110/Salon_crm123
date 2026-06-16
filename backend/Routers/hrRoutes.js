const express = require('express');
const router = express.Router();
const {
    getAllStaff,
    updateStaffHR,
    markAttendance,
    getAttendance,
    getAttendanceSummary,
    getShifts,
    upsertShift,
    generatePayroll,
    getPayroll,
    updatePayrollStatus,
    getLeaveRequests,
    updateLeaveStatus,
    getOverallPerformance,
    updateRoster,
    deleteShift,
    sendPayrollWhatsApp,
    getSalaryAdvances,
    createSalaryAdvance,
    updateSalaryAdvance,
    deleteSalaryAdvance,
    punchAttendance,
    getMyTodayAttendance,
    getMyAttendanceHistory,
    getMyWorksite
} = require('../Controllers/hrController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);

// Self-attendance routes (accessible to any logged-in staff member)
router.post('/attendance/punch', punchAttendance);
router.get('/attendance/me', getMyTodayAttendance);
router.get('/attendance/history', getMyAttendanceHistory);
router.get('/attendance/worksite', getMyWorksite);

// HR admin routes require 'admin', 'manager', or 'p:hr' permission
router.use(authorize('admin', 'manager', 'p:hr'));

router.get('/staff', getAllStaff);
router.put('/staff/:id', updateStaffHR);

router.post('/attendance', markAttendance);
router.get('/attendance', getAttendance);
router.get('/attendance/summary', getAttendanceSummary);

router.get('/shifts', getShifts);
router.post('/shifts', upsertShift);
router.patch('/shifts/:id/roster', updateRoster);
router.delete('/shifts/:id', deleteShift);

router.post('/payroll/generate', generatePayroll);
router.get('/payroll', getPayroll);
router.patch('/payroll/:id/status', updatePayrollStatus);
router.post('/payroll/:id/whatsapp', sendPayrollWhatsApp);

// Salary Advance Routes
router.get('/salary-advances', getSalaryAdvances);
router.post('/salary-advances', createSalaryAdvance);
router.put('/salary-advances/:id', updateSalaryAdvance);
router.delete('/salary-advances/:id', deleteSalaryAdvance);

router.get('/leaves', getLeaveRequests);
router.put('/leaves/:id', updateLeaveStatus);

router.get('/performance', getOverallPerformance);

module.exports = router;
