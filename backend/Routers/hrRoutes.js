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
    deleteShift
} = require('../Controllers/hrController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);
router.use(authorize('admin', 'manager'));

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

router.get('/leaves', getLeaveRequests);
router.put('/leaves/:id', updateLeaveStatus);

router.get('/performance', getOverallPerformance);

module.exports = router;
