const Staff = require('../Models/Staff');
const Attendance = require('../Models/Attendance');
const Payroll = require('../Models/Payroll');
const Shift = require('../Models/Shift');
const LeaveRequest = require('../Models/LeaveRequest');
const Booking = require('../Models/Booking');
const mongoose = require('mongoose');

// @desc    Get all staff with HR profiles
// @route   GET /api/hr/staff
// @access  Private/Admin
exports.getAllStaff = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const staff = await Staff.find({ salonId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: staff.length, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update staff HR profile
// @route   PUT /api/hr/staff/:id
// @access  Private/Admin
exports.updateStaffHR = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndUpdate(req.params.id, { hrProfile: req.body.hrProfile }, { new: true, runValidators: true });
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark attendance
// @route   POST /api/hr/attendance
// @access  Private/Admin
exports.markAttendance = async (req, res) => {
    try {
        const { staffId, date, status, checkIn, checkOut, notes } = req.body;
        const salonId = req.user.salonId;

        // Use atomic findOneAndUpdate to handle upsert
        const attendance = await Attendance.findOneAndUpdate(
            { staffId, date: new Date(date).setHours(0,0,0,0) },
            { 
                staffId, 
                salonId, 
                date: new Date(date).setHours(0,0,0,0), 
                status, 
                checkIn, 
                checkOut, 
                notes,
                performedBy: req.user._id
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get attendance logs
// @route   GET /api/hr/attendance
// @access  Private/Admin
exports.getAttendance = async (req, res) => {
    try {
        const { startDate, endDate, staffId } = req.query;
        const salonId = req.user.salonId;

        let query = { salonId };
        if (staffId) query.staffId = staffId;
        if (startDate && endDate) {
            query.date = { 
                $gte: new Date(startDate).setHours(0,0,0,0), 
                $lte: new Date(endDate).setHours(23,59,59,999) 
            };
        }

        const attendance = await Attendance.find(query).populate('staffId', 'name role').sort({ date: -1 });
        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get shifts
// @route   GET /api/hr/shifts
// @access  Private/Admin
exports.getShifts = async (req, res) => {
    try {
        const shifts = await Shift.find({ salonId: req.user.salonId });
        res.status(200).json({ success: true, data: shifts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upsert shift
// @route   POST /api/hr/shifts
// @access  Private/Admin
exports.upsertShift = async (req, res) => {
    try {
        const { id, name, startTime, endTime, colorClass, colorHex, description, status } = req.body;
        const salonId = req.user.salonId;

        let shift;
        if (id) {
            shift = await Shift.findByIdAndUpdate(id, { name, startTime, endTime, colorClass, colorHex, description, status }, { new: true });
        } else {
            shift = await Shift.create({ salonId, name, startTime, endTime, colorClass, colorHex, description, status });
        }

        res.status(200).json({ success: true, data: shift });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update shift roster
// @route   PATCH /api/hr/shifts/:id/roster
// @access  Private/Admin
exports.updateRoster = async (req, res) => {
    try {
        const { id } = req.params;
        const { userIds } = req.body;

        const shift = await Shift.findByIdAndUpdate(
            id,
            { assignedStaff: userIds },
            { new: true }
        ).populate('assignedStaff', 'name role');

        if (!shift) {
            return res.status(404).json({ success: false, message: 'Shift not found' });
        }

        res.status(200).json({ success: true, data: shift });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete shift
// @route   DELETE /api/hr/shifts/:id
// @access  Private/Admin
exports.deleteShift = async (req, res) => {
    try {
        const shift = await Shift.findOneAndDelete({ _id: req.params.id, salonId: req.user.salonId });
        if (!shift) {
            return res.status(404).json({ success: false, message: 'Shift not found' });
        }
        res.status(200).json({ success: true, message: 'Shift deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate payroll
// @route   POST /api/hr/payroll/generate
// @access  Private/Admin
exports.generatePayroll = async (req, res) => {
    try {
        const { month, year, staffId } = req.body;
        const salonId = req.user.salonId;

        let staffList = [];
        if (staffId) {
            const singleStaff = await Staff.findById(staffId);
            if (singleStaff) staffList.push(singleStaff);
        } else {
            staffList = await Staff.find({ salonId, status: 'active' });
        }

        const payrollResults = [];
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        for (const staff of staffList) {
            const baseSalary = staff.hrProfile?.baseSalary || 0;
            
            // Calculate deductions based on attendance
            const attendance = await Attendance.find({
                staffId: staff._id,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            });

            const absentDays = attendance.filter(a => a.status === 'absent').length;
            const dailyRate = baseSalary / 30;
            const deductions = Math.round(absentDays * dailyRate);
            const netSalary = baseSalary - deductions;

            const payroll = await Payroll.findOneAndUpdate(
                { staffId: staff._id, month, year },
                { 
                    staffId: staff._id, 
                    salonId, 
                    month, 
                    year, 
                    baseSalary, 
                    commission: 0, // Placeholder for calculation logic
                    deductions, 
                    netSalary,
                    status: 'draft',
                    performedBy: req.user._id
                },
                { new: true, upsert: true }
            );
            payrollResults.push(payroll);
        }

        res.status(200).json({ success: true, count: payrollResults.length, data: payrollResults });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get payroll records
// @route   GET /api/hr/payroll
// @access  Private/Admin
exports.getPayroll = async (req, res) => {
    try {
        const { month, year } = req.query;
        const salonId = req.user.salonId;

        let query = { salonId };
        if (month) query.month = month;
        if (year) query.year = year;

        const payroll = await Payroll.find(query).populate('staffId', 'name role').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: payroll });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get leave requests
// @route   GET /api/hr/leaves
// @access  Private/Admin
exports.getLeaveRequests = async (req, res) => {
    try {
        const requests = await LeaveRequest.find({ salonId: req.user.salonId }).populate('staffId', 'name role').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update leave status
// @route   PUT /api/hr/leaves/:id
// @access  Private/Admin
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const request = await LeaveRequest.findByIdAndUpdate(
            req.params.id, 
            { status, adminNotes, approvedBy: req.user._id }, 
            { new: true }
        );
        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get overall performance
// @route   GET /api/hr/performance
// @access  Private/Admin
exports.getOverallPerformance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const salonId = req.user.salonId;

        const staff = await Staff.find({ salonId, status: 'active' });
        
        const performanceData = await Promise.all(staff.map(async (s) => {
            const query = {
                salonId,
                "stylists.stylistId": s._id,
                status: 'completed'
            };
            if (startDate && endDate) {
                query.appointmentDate = { $gte: startDate, $lte: endDate };
            }

            const bookings = await Booking.find(query);
            const revenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
            
            // Tier logic
            let contribution = 'Low';
            if (revenue > 50000) contribution = 'Elite';
            else if (revenue > 20000) contribution = 'High';
            else if (revenue > 5000) contribution = 'Medium';

            return {
                id: s._id,
                staff: s.name,
                role: s.role,
                revenue,
                services: bookings.length,
                rating: 4.5, // Placeholder for now
                goal: s.hrProfile?.revenueTarget || 0,
                contribution
            };
        }));

        res.status(200).json({ 
            success: true, 
            data: {
                period: { startDate, endDate },
                staff: performanceData
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
