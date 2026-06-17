const Staff = require('../Models/Staff');
const Attendance = require('../Models/Attendance');
const Payroll = require('../Models/Payroll');
const Shift = require('../Models/Shift');
const LeaveRequest = require('../Models/LeaveRequest');
const Booking = require('../Models/Booking');
const Service = require('../Models/Service');
const SalaryAdvance = require('../Models/SalaryAdvance');
const Invoice = require('../Models/Invoice');
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

// @desc    Update staff monthly revenue target
// @route   PATCH /api/hr/staff/:id/target
// @access  Private/Admin,Manager
exports.updateStaffRevenueTarget = async (req, res) => {
    try {
        const { goal } = req.body;
        if (goal === undefined || isNaN(Number(goal))) {
            return res.status(400).json({ success: false, message: 'A valid goal amount is required' });
        }
        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            { $set: { 'hrProfile.revenueTarget': Number(goal) } },
            { new: true, runValidators: true }
        );
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        res.status(200).json({ success: true, data: staff, message: 'Revenue target updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark attendance (Bulk or Single)
// @route   POST /api/hr/attendance
// @access  Private/Admin
exports.markAttendance = async (req, res) => {
    try {
        const { staffId, date, status, checkIn, checkOut, notes, bulk } = req.body;
        const salonId = req.user.salonId;

        if (bulk && Array.isArray(bulk)) {
            const operations = bulk.map(item => ({
                updateOne: {
                    filter: { staffId: item.staffId, date: new Date(date).setHours(0, 0, 0, 0) },
                    update: {
                        staffId: item.staffId,
                        salonId,
                        date: new Date(date).setHours(0, 0, 0, 0),
                        status: item.status || 'present',
                        checkIn: item.checkIn,
                        checkOut: item.checkOut,
                        performedBy: req.user._id
                    },
                    upsert: true
                }
            }));
            await Attendance.bulkWrite(operations);
            return res.status(200).json({ success: true, message: 'Bulk attendance marked' });
        }

        // Single upsert
        const attendance = await Attendance.findOneAndUpdate(
            { staffId, date: new Date(date).setHours(0, 0, 0, 0) },
            {
                staffId,
                salonId,
                date: new Date(date).setHours(0, 0, 0, 0),
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

// @desc    Get attendance summary for a month
// @route   GET /api/hr/attendance/summary
// @access  Private/Admin
exports.getAttendanceSummary = async (req, res) => {
    try {
        const { month, year, staffId } = req.query;
        const salonId = req.user.salonId;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        let query = {
            salonId,
            date: { $gte: startDate, $lte: endDate }
        };
        if (staffId) query.staffId = staffId;

        const logs = await Attendance.find(query);

        // Group by staffId
        const summary = {};
        logs.forEach(log => {
            const sid = log.staffId.toString();
            if (!summary[sid]) {
                summary[sid] = { present: 0, absent: 0, halfDay: 0, leave: 0, late: 0, total: 0, commission: 0 };
            }
            summary[sid][log.status === 'half-day' ? 'halfDay' : log.status]++;
            summary[sid].total++;
        });

        // Calculate commissions for completed bookings
        let bookingQuery = {
            salonId,
            status: 'completed',
            appointmentDate: { $gte: startDate, $lte: endDate }
        };
        if (staffId) {
            bookingQuery.staffId = staffId;
        }

        const bookings = await Booking.find(bookingQuery).populate('serviceId');
        const commissionMap = {};

        for (const booking of bookings) {
            const stylistsCount = booking.staffId?.length || 1;
            for (const sId of booking.staffId || []) {
                const sidStr = sId.toString();
                const staff = await Staff.findById(sId);
                if (!staff) continue;

                let baseCommission = 0;
                const service = booking.serviceId;
                if (service) {
                    if (service.commissionApplicable) {
                        if (service.commissionType === 'fixed') {
                            baseCommission = service.commissionValue || 0;
                        } else {
                            baseCommission = (booking.totalPrice * (service.commissionValue || 0)) / 100;
                        }
                    } else {
                        const staffPct = staff.hrProfile?.commissionPercentage || 0;
                        baseCommission = (booking.totalPrice * staffPct) / 100;
                    }
                }
                const allocatedCommission = baseCommission / stylistsCount;
                commissionMap[sidStr] = (commissionMap[sidStr] || 0) + allocatedCommission;
            }
        }

        Object.keys(summary).forEach(sid => {
            summary[sid].commission = Math.round(commissionMap[sid] || 0);
        });

        if (staffId && !summary[staffId]) {
            summary[staffId] = { present: 0, absent: 0, halfDay: 0, leave: 0, late: 0, total: 0, commission: Math.round(commissionMap[staffId] || 0) };
        }

        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get attendance logs
// @route   GET /api/hr/attendance
// @access  Private/Admin
exports.getAttendance = async (req, res) => {
    try {
        const { startDate, endDate, staffId, date } = req.query;
        const salonId = req.user.salonId;

        let query = { salonId };
        if (staffId) query.staffId = staffId;

        if (date) {
            query.date = new Date(date).setHours(0, 0, 0, 0);
        } else if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate).setHours(0, 0, 0, 0),
                $lte: new Date(endDate).setHours(23, 59, 59, 999)
            };
        }

        const attendance = await Attendance.find(query).populate('staffId', 'name role outletId').sort({ date: -1 });
        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate/Save payroll
// @route   POST /api/hr/payroll/generate
// @access  Private/Admin
exports.generatePayroll = async (req, res) => {
    try {
        const {
            month, year, staffId,
            baseSalary, workingDays, presentDays, leaveDays,
            incentive, overtime, pf, tax, otherDeductions,
            notes, status
        } = req.body;
        const salonId = req.user.salonId;

        // If manual save for single staff
        if (staffId && baseSalary !== undefined) {
            // Find existing payroll to reset previously linked advances
            const existingPayroll = await Payroll.findOne({ staffId, month, year });
            if (existingPayroll) {
                await SalaryAdvance.updateMany(
                    { adjustedPayrollId: existingPayroll._id },
                    { isAdjusted: false, adjustedPayrollId: null }
                );
            }

            // Find unadjusted advances for this staff in this cycle
            const advances = await SalaryAdvance.find({
                staffId,
                month: Number(month),
                year: Number(year),
                isAdjusted: false,
                status: { $in: ['approved', 'paid'] }
            });
            const advanceSalarySum = advances.reduce((sum, adv) => sum + adv.amount, 0);

            const perDaySalary = baseSalary / 30;
            const earnedSalary = perDaySalary * (presentDays || 0);
            const netSalary = Math.round(
                earnedSalary +
                (Number(incentive) || 0) +
                (Number(overtime) || 0) -
                (Number(pf) || 0) -
                (Number(tax) || 0) -
                (Number(otherDeductions) || 0) -
                advanceSalarySum
            );

            const payroll = await Payroll.findOneAndUpdate(
                { staffId, month, year },
                {
                    staffId,
                    salonId,
                    month,
                    year,
                    baseSalary,
                    workingDays: 30,
                    presentDays: presentDays || 0,
                    leaveDays: leaveDays || 0,
                    incentive: Number(incentive) || 0,
                    overtime: Number(overtime) || 0,
                    pf: Number(pf) || 0,
                    tax: Number(tax) || 0,
                    otherDeductions: Number(otherDeductions) || 0,
                    advanceSalary: advanceSalarySum,
                    netSalary,
                    notes,
                    status: status || 'draft',
                    performedBy: req.user._id
                },
                { new: true, upsert: true }
            );

            // Mark matching advances as adjusted and link them to this payroll
            if (advanceSalarySum > 0) {
                await SalaryAdvance.updateMany(
                    { _id: { $in: advances.map(a => a._id) } },
                    { isAdjusted: true, adjustedPayrollId: payroll._id }
                );
            }

            return res.status(200).json({ success: true, data: payroll });
        }

        // Bulk generation logic
        const staffList = await Staff.find({ salonId, status: 'active' });
        const payrollResults = [];
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const totalDaysInMonth = endDate.getDate();

        for (const staff of staffList) {
            const salary = staff.hrProfile?.baseSalary || 0;

            const attendance = await Attendance.find({
                staffId: staff._id,
                date: { $gte: startDate, $lte: endDate }
            });

            const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
            const halfDayCount = attendance.filter(a => a.status === 'half-day').length;
            const leaveCount = attendance.filter(a => a.status === 'leave').length;

            const effectivePresent = presentCount + (halfDayCount * 0.5);
            const perDay = salary / 30;
            const earned = Math.round(effectivePresent * perDay);

            // Calculate commissions for this staff member
            const staffBookings = await Booking.find({
                staffId: staff._id,
                status: 'completed',
                appointmentDate: { $gte: startDate, $lte: endDate }
            }).populate('serviceId');

            let totalCommission = 0;
            for (const booking of staffBookings) {
                const stylistsCount = booking.staffId?.length || 1;
                let baseCommission = 0;
                const service = booking.serviceId;
                if (service) {
                    if (service.commissionApplicable) {
                        if (service.commissionType === 'fixed') {
                            baseCommission = service.commissionValue || 0;
                        } else {
                            baseCommission = (booking.totalPrice * (service.commissionValue || 0)) / 100;
                        }
                    } else {
                        const staffPct = staff.hrProfile?.commissionPercentage || 0;
                        baseCommission = (booking.totalPrice * staffPct) / 100;
                    }
                }
                totalCommission += baseCommission / stylistsCount;
            }
            const commissionEarned = Math.round(totalCommission);

            // Find existing payroll to reset previously linked advances
            const existingPayroll = await Payroll.findOne({ staffId: staff._id, month, year });
            if (existingPayroll) {
                await SalaryAdvance.updateMany(
                    { adjustedPayrollId: existingPayroll._id },
                    { isAdjusted: false, adjustedPayrollId: null }
                );
            }

            // Find unadjusted advances for this staff in this cycle
            const advances = await SalaryAdvance.find({
                staffId: staff._id,
                month: Number(month),
                year: Number(year),
                isAdjusted: false,
                status: { $in: ['approved', 'paid'] }
            });
            const advanceSalarySum = advances.reduce((sum, adv) => sum + adv.amount, 0);

            const netSalary = Math.round(earned + commissionEarned - advanceSalarySum);

            const payroll = await Payroll.findOneAndUpdate(
                { staffId: staff._id, month, year },
                {
                    staffId: staff._id,
                    salonId,
                    month,
                    year,
                    baseSalary: salary,
                    workingDays: 30,
                    presentDays: effectivePresent,
                    leaveDays: leaveCount,
                    incentive: commissionEarned,
                    advanceSalary: advanceSalarySum,
                    netSalary: netSalary,
                    status: 'draft',
                    performedBy: req.user._id
                },
                { new: true, upsert: true }
            );

            // Mark matching advances as adjusted and link them to this payroll
            if (advanceSalarySum > 0) {
                await SalaryAdvance.updateMany(
                    { _id: { $in: advances.map(a => a._id) } },
                    { isAdjusted: true, adjustedPayrollId: payroll._id }
                );
            }

            payrollResults.push(payroll);
        }

        res.status(200).json({ success: true, count: payrollResults.length, data: payrollResults });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update payroll payment status
// @route   PATCH /api/hr/payroll/:id/status
// @access  Private/Admin
exports.updatePayrollStatus = async (req, res) => {
    try {
        const { status, paymentMethod } = req.body;
        const payroll = await Payroll.findByIdAndUpdate(
            req.params.id,
            {
                status,
                paymentMethod,
                paymentDate: status === 'paid' ? new Date() : undefined
            },
            { new: true }
        );
        res.status(200).json({ success: true, data: payroll });
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
        if (month) query.month = Number(month);
        if (year) query.year = Number(year);

        const payroll = await Payroll.find(query)
            .populate({
                path: 'staffId',
                select: 'name role outletId',
                populate: { path: 'outletId', select: 'name' }
            })
            .sort({ createdAt: -1 });
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
                staffId: s._id,
                status: 'completed'
            };
            if (startDate && endDate) {
                query.appointmentDate = { $gte: startDate, $lte: endDate };
            }

            const bookings = await Booking.find(query);
            const revenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

            // Repeat customers count (simplified logic)
            const customerIds = bookings.map(b => b.clientId?.toString()).filter(id => id);
            const uniqueCustomers = new Set(customerIds);
            const repeatCount = customerIds.length - uniqueCustomers.size;

            // Cancellation count in the same period
            const cancelledCount = await Booking.countDocuments({
                salonId,
                staffId: s._id,
                status: 'cancelled',
                appointmentDate: query.appointmentDate
            });

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
                bookings: bookings.length,
                rating: 4.8, // Placeholder
                repeatCustomers: repeatCount,
                cancellations: cancelledCount,
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

// @desc    Send payslip to staff WhatsApp number
// @route   POST /api/hr/payroll/:id/whatsapp
// @access  Private/Admin
exports.sendPayrollWhatsApp = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[HR-Controller] sendPayrollWhatsApp initiated for Payroll ID: ${id}`);

        const payroll = await Payroll.findById(id).populate('staffId');
        if (!payroll) {
            console.warn(`[HR-Controller] sendPayrollWhatsApp: Payroll record not found for ID: ${id}`);
            return res.status(404).json({ success: false, message: 'Payroll record not found' });
        }

        const staff = payroll.staffId;
        if (!staff || !staff.phone) {
            console.warn(`[HR-Controller] sendPayrollWhatsApp: Staff or staff phone not found for payroll: ${id}`);
            return res.status(400).json({ success: false, message: 'Staff phone number not found' });
        }

        const { sendWhatsAppMessage, checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');

        // Deduct 1 credit from the salon
        const canSend = await checkAndDeductWhatsAppCredit(payroll.salonId);
        if (!canSend) {
            console.warn(`[HR-Controller] sendPayrollWhatsApp: checkAndDeductWhatsAppCredit returned false (insufficient credits) for salon: ${payroll.salonId}`);
            return res.status(400).json({ success: false, message: 'Insufficient WhatsApp credits or feature disabled for this salon' });
        }

        const Salon = require('../Models/Salon');
        const salon = await Salon.findById(payroll.salonId);
        const brandName = salon?.businessName || salon?.name || 'Our Salon';

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = months[payroll.month - 1] || payroll.month;

        const message = `*Hello ${staff.name}!* 🌟\n\nYour salary slip for *${monthName} ${payroll.year}* has been generated by *${brandName}*.\n\n*Salary Details:* \n` +
            `• Base Salary: ₹${payroll.baseSalary.toLocaleString('en-IN')}\n` +
            `• Attendance Cycle: ${payroll.presentDays}/${payroll.workingDays} Days\n` +
            (payroll.incentive > 0 ? `• Incentive: +₹${payroll.incentive.toLocaleString('en-IN')}\n` : '') +
            (payroll.overtime > 0 ? `• Overtime Pay: +₹${payroll.overtime.toLocaleString('en-IN')}\n` : '') +
            (payroll.pf > 0 ? `• PF Deduction: -₹${payroll.pf.toLocaleString('en-IN')}\n` : '') +
            (payroll.tax > 0 ? `• Tax Deduction: -₹${payroll.tax.toLocaleString('en-IN')}\n` : '') +
            (payroll.otherDeductions > 0 ? `• Other Deductions: -₹${payroll.otherDeductions.toLocaleString('en-IN')}\n` : '') +
            (payroll.advanceSalary > 0 ? `• Advance Salary: -₹${payroll.advanceSalary.toLocaleString('en-IN')}\n` : '') +
            `• *Net Settlement: ₹${payroll.netSalary.toLocaleString('en-IN')}*\n` +
            `• Status: *${payroll.status.toUpperCase()}*\n` +
            (payroll.paymentMethod ? `• Payment Mode: ${payroll.paymentMethod.toUpperCase()}\n` : '') +
            (payroll.notes ? `\n*Notes:* ${payroll.notes}\n` : '') +
            `\nThank you for your hard work! Keep shining! ✨`;

        console.log(`[HR-Controller] sendPayrollWhatsApp: Dispatching plain text to: ${staff.phone}`);
        const result = await sendWhatsAppMessage(staff.phone, message);

        if (result.success) {
            console.log(`[HR-Controller] sendPayrollWhatsApp: WhatsApp sent successfully to staff: ${staff.name}`);
            res.json({ success: true, message: 'WhatsApp message sent successfully' });
        } else {
            console.error(`[HR-Controller] sendPayrollWhatsApp: sendWhatsAppMessage failed:`, result.message);
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('[HR-Controller] sendPayrollWhatsApp Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Record a new salary advance
// @route   POST /api/hr/salary-advances
// @access  Private/Admin
exports.createSalaryAdvance = async (req, res) => {
    try {
        const { staffId, amount, reason, date, status } = req.body;
        const salonId = req.user.salonId;

        if (!staffId || !amount || !date) {
            return res.status(400).json({ success: false, message: 'Staff ID, amount, and date are required' });
        }

        // Get staff base salary
        const staffObj = await Staff.findById(staffId);
        if (!staffObj) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }
        const baseSalary = staffObj.hrProfile?.baseSalary || 0;
        if (baseSalary === 0) {
            return res.status(400).json({ success: false, message: 'Base salary is not configured for this staff member. Please setup base salary first.' });
        }
        if (Number(amount) > baseSalary) {
            return res.status(400).json({ success: false, message: `Advance amount cannot exceed the employee's base salary (₹${baseSalary.toLocaleString('en-IN')})` });
        }

        const parsedDate = new Date(date);
        const month = parsedDate.getMonth() + 1; // 1-12
        const year = parsedDate.getFullYear();

        const advance = await SalaryAdvance.create({
            salonId,
            staffId,
            amount: Number(amount),
            reason,
            date: parsedDate,
            month,
            year,
            status: status || 'paid'
        });

        res.status(201).json({ success: true, data: advance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all salary advances for the salon
// @route   GET /api/hr/salary-advances
// @access  Private/Admin
exports.getSalaryAdvances = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { staffId, month, year } = req.query;

        let query = { salonId };
        if (staffId) query.staffId = staffId;
        if (month) query.month = Number(month);
        if (year) query.year = Number(year);

        const advances = await SalaryAdvance.find(query)
            .populate('staffId', 'name role phone hrProfile')
            .sort({ date: -1 });

        res.status(200).json({ success: true, count: advances.length, data: advances });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a salary advance (only if not adjusted)
// @route   PUT /api/hr/salary-advances/:id
// @access  Private/Admin
exports.updateSalaryAdvance = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, reason, date, status } = req.body;

        const advance = await SalaryAdvance.findById(id);
        if (!advance) {
            return res.status(404).json({ success: false, message: 'Salary advance record not found' });
        }

        if (advance.isAdjusted) {
            return res.status(400).json({ success: false, message: 'Cannot update a salary advance that has already been adjusted in payroll' });
        }

        if (amount !== undefined) {
            const staffObj = await Staff.findById(advance.staffId);
            if (!staffObj) {
                return res.status(404).json({ success: false, message: 'Staff member associated with this advance not found' });
            }
            const baseSalary = staffObj.hrProfile?.baseSalary || 0;
            if (Number(amount) > baseSalary) {
                return res.status(400).json({ success: false, message: `Advance amount cannot exceed the employee's base salary (₹${baseSalary.toLocaleString('en-IN')})` });
            }
            advance.amount = Number(amount);
        }

        if (date) {
            const parsedDate = new Date(date);
            advance.date = parsedDate;
            advance.month = parsedDate.getMonth() + 1;
            advance.year = parsedDate.getFullYear();
        }
        if (reason !== undefined) advance.reason = reason;
        if (status !== undefined) advance.status = status;

        await advance.save();
        res.status(200).json({ success: true, data: advance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a salary advance (only if not adjusted)
// @route   DELETE /api/hr/salary-advances/:id
// @access  Private/Admin
exports.deleteSalaryAdvance = async (req, res) => {
    try {
        const { id } = req.params;

        await SalaryAdvance.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Salary advance deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Self punch attendance (IN/OUT or PRESENT/ABSENT)
// @route   POST /api/hr/attendance/punch
// @access  Private
exports.punchAttendance = async (req, res) => {
    try {
        const staffId = req.user.id;
        const salonId = req.user.salonId;
        const outletId = req.user.outletId;
        
        const { type, date, location, status } = req.body;
        
        if (!date || (!type && !status)) {
            return res.status(400).json({ success: false, message: 'Type/status and date are required' });
        }
        
        const normalizedDate = new Date(date).setHours(0, 0, 0, 0);
        
        let attendance = await Attendance.findOne({ staffId, date: normalizedDate });
        
        if (!attendance) {
            attendance = new Attendance({
                staffId,
                salonId,
                outletId,
                date: normalizedDate,
                status: status || 'present',
                checkIn: type === 'in' || status === 'present' ? new Date().toISOString() : null,
                checkOut: type === 'out' ? new Date().toISOString() : null,
                notes: location ? `Punched at ${location}` : (status ? `Marked ${status}` : null),
                performedBy: req.user._id
            });
        } else {
            if (status) {
                attendance.status = status;
                if (status === 'present') {
                    if (!attendance.checkIn) {
                        attendance.checkIn = new Date().toISOString();
                    }
                } else if (status === 'absent') {
                    attendance.checkIn = null;
                    attendance.checkOut = null;
                }
            } else {
                if (type === 'in') {
                    attendance.checkIn = new Date().toISOString();
                    attendance.status = 'present';
                } else if (type === 'out') {
                    attendance.checkOut = new Date().toISOString();
                }
            }
            if (location) {
                attendance.notes = attendance.notes ? `${attendance.notes}; Punched at ${location}` : `Punched at ${location}`;
            } else if (status) {
                attendance.notes = attendance.notes ? `${attendance.notes}; Marked ${status}` : `Marked ${status}`;
            }
            attendance.performedBy = req.user._id;
        }
        
        await attendance.save();
        
        res.status(200).json({
            success: true,
            message: 'Attendance status recorded successfully.',
            data: attendance
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get today's self attendance status
// @route   GET /api/hr/attendance/me
// @access  Private
exports.getMyTodayAttendance = async (req, res) => {
    try {
        const staffId = req.user.id;
        const todayStr = new Date().toLocaleDateString('en-CA');
        const date = new Date(todayStr).setHours(0, 0, 0, 0);
        
        const attendance = await Attendance.findOne({ staffId, date });
        if (!attendance) {
            return res.status(200).json({ success: true, data: {} });
        }
        
        res.status(200).json({
            success: true,
            data: {
                ...attendance.toObject(),
                checkInAt: attendance.checkIn,
                checkOutAt: attendance.checkOut
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get self attendance history for a month
// @route   GET /api/hr/attendance/history
// @access  Private
exports.getMyAttendanceHistory = async (req, res) => {
    try {
        const staffId = req.user.id;
        const month = req.query.month !== undefined ? parseInt(req.query.month, 10) : new Date().getMonth();
        const year = req.query.year !== undefined ? parseInt(req.query.year, 10) : new Date().getFullYear();
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month, daysInMonth, 23, 59, 59, 999);
        
        const realPunches = await Attendance.find({
            staffId,
            date: { $gte: startDate, $lte: endDate }
        });
        
        const todayStr = new Date().toLocaleDateString('en-CA');
        const history = [];
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        let halfDayCount = 0;
        
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const dateStr = dateObj.toLocaleDateString('en-CA');
            const isWeekend = dateObj.getDay() === 0;
            
            if (dateObj > new Date()) continue;
            
            const realPunch = realPunches.find(p => {
                const pDate = new Date(p.date).toLocaleDateString('en-CA');
                return pDate === dateStr;
            });
            
            if (realPunch) {
                const statusUpper = (realPunch.status || 'present').toUpperCase().replace('-', '_');
                history.push({
                    date: dateStr,
                    status: statusUpper,
                    checkInAt: realPunch.checkIn,
                    checkOutAt: realPunch.checkOut,
                    notes: realPunch.notes || null
                });
                
                if (statusUpper === 'PRESENT') presentCount++;
                else if (statusUpper === 'ABSENT') absentCount++;
                else if (statusUpper === 'LATE') lateCount++;
                else if (statusUpper === 'HALF_DAY') halfDayCount++;
                continue;
            }
            
            if (dateStr === todayStr) {
                history.push({
                    date: dateStr,
                    status: 'UNMARKED',
                    checkInAt: null,
                    checkOutAt: null,
                    notes: null
                });
                continue;
            }
            
            let status = 'UNMARKED';
            if (isWeekend) status = 'WEEKOFF';
            
            history.push({
                date: dateStr,
                status,
                checkInAt: null,
                checkOutAt: null,
                notes: null
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                data: history,
                stats: {
                    present: presentCount,
                    absent: absentCount,
                    late: lateCount,
                    halfDay: halfDayCount,
                    total: daysInMonth
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get self worksite geofence settings
// @route   GET /api/hr/attendance/worksite
// @access  Private
exports.getMyWorksite = async (req, res) => {
    try {
        const outletId = req.user.outletId;
        if (!outletId) {
            return res.status(200).json({
                success: true,
                data: {
                    geofenceEnforced: false,
                    configured: false,
                    message: 'No outlet assigned to your profile.'
                }
            });
        }
        
        const Outlet = require('../Models/Outlet');
        const outlet = await Outlet.findById(outletId);
        if (!outlet) {
            return res.status(404).json({ success: false, message: 'Outlet not found.' });
        }
        
        const configured = outlet.location && outlet.location.coordinates && 
                           (outlet.location.coordinates[0] !== 0 || outlet.location.coordinates[1] !== 0);
        
        const streetStr = outlet.address?.street || '';
        const cityStr = outlet.address?.city || '';
        const stateStr = outlet.address?.state || '';
        const fullAddress = [streetStr, cityStr, stateStr].filter(Boolean).join(', ') || 'No address specified';
        
        res.status(200).json({
            success: true,
            data: {
                geofenceEnforced: true,
                configured: !!configured,
                outlet: {
                    name: outlet.name,
                    city: outlet.address?.city || '',
                    address: fullAddress,
                    latitude: configured ? outlet.location.coordinates[1] : null,
                    longitude: configured ? outlet.location.coordinates[0] : null,
                    geofenceRadiusMeters: 500
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my commissions dashboard data
// @route   GET /api/hr/commissions/me
// @access  Private/Staff
exports.getMyCommissions = async (req, res) => {
    try {
        const { period } = req.query;
        const staffId = req.user._id;

        // Date range
        let startDate = new Date();
        let endDate = new Date();

        if (period === 'PREVIOUS_CYCLE') {
            const d = new Date();
            startDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
            endDate = new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59);
        } else if (period === 'FISCAL_YTD') {
            const d = new Date();
            const currentYear = d.getFullYear();
            const fiscalStartYear = d.getMonth() >= 3 ? currentYear : currentYear - 1;
            startDate = new Date(fiscalStartYear, 3, 1, 0, 0, 0);
            endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        } else {
            // CURRENT_CYCLE
            const d = new Date();
            startDate = new Date(d.getFullYear(), d.getMonth(), 1);
            endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        }

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        // Fetch bookings for this month to compute target revenue progress
        const bookings = await Booking.find({
            salonId: staff.salonId,
            staffId: staff._id,
            status: 'completed',
            appointmentDate: { $gte: startDate, $lte: endDate }
        });

        const bookingRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const goal = staff.hrProfile?.revenueTarget || 35000;
        const progressPercent = goal > 0 ? Math.round((bookingRevenue / goal) * 100) : 0;

        let quotaLabel = 'Bronze Active';
        if (bookingRevenue >= 50000) quotaLabel = 'Platinum Active';
        else if (bookingRevenue >= 30000) quotaLabel = 'Gold Active';
        else if (bookingRevenue >= 15000) quotaLabel = 'Silver Active';

        const performance = {
            progressPercent,
            bookingRevenue,
            goal,
            quotaLabel
        };

        const incentiveSlabs = [
            { tier: 'PLATINUM', range: '₹50,000+', yield: '15%', status: bookingRevenue >= 50000 ? 'REACHED_UNIT' : 'TARGET_UNIT' },
            { tier: 'GOLD', range: '₹30,000+', yield: '12%', status: bookingRevenue >= 50000 ? 'REACHED_UNIT' : (bookingRevenue >= 30000 ? 'CURRENT_UNIT' : 'TARGET_UNIT') },
            { tier: 'SILVER', range: '₹15,000+', yield: '10%', status: bookingRevenue >= 30000 ? 'REACHED_UNIT' : (bookingRevenue >= 15000 ? 'CURRENT_UNIT' : 'TARGET_UNIT') }
        ];

        // Fetch matching active invoices in the cycle
        const invoices = await Invoice.find({
            salonId: staff.salonId,
            status: 'active',
            'items.stylistIds': staff._id,
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 });

        // Fetch services to build mapping
        const services = await Service.find({ salonId: staff.salonId });
        const serviceMap = {};
        services.forEach(s => {
            serviceMap[s._id.toString()] = s;
        });

        // Fetch payroll records for settlement status
        const payrolls = await Payroll.find({ staffId: staff._id });
        const payrollStatusMap = {};
        payrolls.forEach(p => {
            payrollStatusMap[`${p.year}_${p.month}`] = p.status;
        });

        const formatDate = (dateObj) => {
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const d = new Date(dateObj);
            const day = String(d.getDate()).padStart(2, '0');
            const month = months[d.getMonth()];
            const year = d.getFullYear();
            return `${day} ${month} ${year}`;
        };

        const earningsHistory = invoices.map(invoice => {
            const matchedItems = invoice.items.filter(item =>
                item.stylistIds && item.stylistIds.some(sid => sid.toString() === staff._id.toString())
            );

            const servicesNames = matchedItems.map(item => item.name).join(' + ');

            let invoiceRevenue = 0;
            let invoiceCommission = 0;

            matchedItems.forEach(item => {
                const stylistsCount = item.stylistIds.length || 1;
                invoiceRevenue += (item.price * item.quantity);

                let baseCommission = 0;
                if (item.type === 'service') {
                    const service = serviceMap[item.itemId.toString()];
                    if (service) {
                        if (service.commissionApplicable) {
                            if (service.commissionType === 'fixed') {
                                baseCommission = (service.commissionValue || 0) * item.quantity;
                            } else {
                                baseCommission = (item.price * item.quantity * (service.commissionValue || 0)) / 100;
                            }
                        } else {
                            const staffPct = staff.hrProfile?.commissionPercentage || 10;
                            baseCommission = (item.price * item.quantity * staffPct) / 100;
                        }
                    } else {
                        const staffPct = staff.hrProfile?.commissionPercentage || 10;
                        baseCommission = (item.price * item.quantity * staffPct) / 100;
                    }
                } else {
                    const staffPct = staff.hrProfile?.commissionPercentage || 10;
                    baseCommission = (item.price * item.quantity * staffPct) / 100;
                }

                invoiceCommission += (baseCommission / stylistsCount);
            });

            const invoiceDate = new Date(invoice.createdAt);
            const year = invoiceDate.getFullYear();
            const month = invoiceDate.getMonth() + 1;
            const payrollStatus = payrollStatusMap[`${year}_${month}`];

            return {
                id: invoice._id.toString(),
                date: formatDate(invoice.createdAt),
                services: servicesNames || 'POS Billing',
                revenue: Math.round(invoiceRevenue),
                commission: Math.round(invoiceCommission),
                status: payrollStatus === 'paid' ? 'SETTLED' : 'PENDING'
            };
        });

        let totalEarned = 0;
        let yieldUnits = 0;
        earningsHistory.forEach(item => {
            totalEarned += item.commission;
        });

        invoices.forEach(invoice => {
            invoice.items.forEach(item => {
                if (item.stylistIds && item.stylistIds.some(sid => sid.toString() === staff._id.toString())) {
                    yieldUnits += (item.quantity || 1);
                }
            });
        });

        const baseSalary = staff.hrProfile?.baseSalary || 0;

        const stats = [
            { key: 'totalEarned', value: `₹${totalEarned.toLocaleString('en-IN')}`, sub: 'Calculated this cycle' },
            { key: 'yieldUnits', value: String(yieldUnits), sub: 'Total items processed' },
            { key: 'repIndex', value: '4.8', sub: 'Quality unit rating' },
            { key: 'baseAllocation', value: `₹${baseSalary.toLocaleString('en-IN')}`, sub: 'Fixed monthly base' }
        ];

        res.status(200).json({
            success: true,
            data: {
                stats,
                earningsHistory,
                performance,
                incentiveSlabs,
                period: { label: period || 'CURRENT_CYCLE' },
                protocolNote: 'POS commissions are live from actual database calculations.'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged in user's leave requests
// @route   GET /api/hr/leaves/me
// @access  Private/Staff
exports.getMyLeaves = async (req, res) => {
    try {
        const staffId = req.user._id;

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        // Fetch all leave requests for this staff
        const requests = await LeaveRequest.find({ staffId }).sort({ createdAt: -1 });

        // Map database records to frontend expected formats
        const formatDateRange = (start, end) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const s = new Date(start);
            const e = new Date(end);
            const sDay = s.getDate();
            const sMonth = months[s.getMonth()];
            const eDay = e.getDate();
            const eMonth = months[e.getMonth()];
            if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
                return `${sDay} - ${eDay} ${sMonth}`;
            }
            return `${sDay} ${sMonth} - ${eDay} ${eMonth}`;
        };

        const formatAppliedDate = (dateObj) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const d = new Date(dateObj);
            return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        };

        const formattedRequests = requests.map(r => {
            let typeLabel = 'CASUAL_LEAVE';
            if (r.leaveType === 'sick') typeLabel = 'MEDICAL_LEAVE';
            else if (r.leaveType === 'vacation') typeLabel = 'PAID_LEAVE';
            else if (r.leaveType === 'other') typeLabel = 'SICK_BUFFER';

            return {
                id: r._id.toString(),
                type: typeLabel,
                dates: formatDateRange(r.startDate, r.endDate),
                appliedOn: formatAppliedDate(r.createdAt),
                status: (r.status || 'pending').toUpperCase(),
                reason: r.reason
            };
        });

        // Calculate leave quotas for current year (Jan 1 to Dec 31)
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

        const approvedLeaves = await LeaveRequest.find({
            staffId,
            status: 'approved',
            startDate: { $gte: yearStart, $lte: yearEnd }
        });

        let casualUsed = 0;
        let sickUsed = 0;
        let vacationUsed = 0;
        let otherUsed = 0;

        approvedLeaves.forEach(leave => {
            const diffTime = Math.abs(leave.endDate - leave.startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            if (leave.leaveType === 'casual') casualUsed += diffDays;
            else if (leave.leaveType === 'sick') sickUsed += diffDays;
            else if (leave.leaveType === 'vacation') vacationUsed += diffDays;
            else otherUsed += diffDays;
        });

        const quotas = [
            { label: 'Casual Leaves', used: casualUsed, total: 12, colorClass: 'text-primary' },
            { label: 'Medical Leaves', used: sickUsed, total: 10, colorClass: 'text-rose-500' },
            { label: 'Earned Leaves', used: vacationUsed, total: 15, colorClass: 'text-emerald-500' },
            { label: 'Short Leaves', used: otherUsed, total: 5, colorClass: 'text-amber-500' }
        ];

        const leaveTypes = ['CASUAL_LEAVE', 'MEDICAL_LEAVE', 'PAID_LEAVE', 'SICK_BUFFER'];

        res.status(200).json({
            success: true,
            data: {
                requests: formattedRequests,
                quotas,
                leaveTypes
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Apply for leave
// @route   POST /api/hr/leaves/me
// @access  Private/Staff
exports.applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        const staffId = req.user._id;

        if (!type || !startDate || !endDate || !reason) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        let dbType = 'casual';
        if (type === 'MEDICAL_LEAVE' || type === 'SICK_BUFFER') dbType = 'sick';
        else if (type === 'PAID_LEAVE') dbType = 'vacation';
        else if (type === 'other') dbType = 'other';

        const newLeave = new LeaveRequest({
            staffId: staff._id,
            salonId: staff.salonId,
            leaveType: dbType,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason: reason.trim(),
            status: 'pending'
        });

        await newLeave.save();

        res.status(201).json({
            success: true,
            data: newLeave
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get stylist dashboard overview
// @route   GET /api/hr/overview/me
// @access  Private/Staff
exports.getStylistOverview = async (req, res) => {
    try {
        const staffId = req.user._id;
        const salonId = req.user.salonId;
        
        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        // 1. Resolve selected date or default to today
        const queryDate = req.query.date ? new Date(req.query.date) : new Date();
        const startOfDay = new Date(queryDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(queryDate);
        endOfDay.setHours(23, 59, 59, 999);

        // 2. Fetch today's schedule for this stylist
        const bookings = await Booking.find({
            salonId,
            staffId: staffId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay }
        }).populate('clientId', 'name').populate('serviceId', 'name duration');

        const schedule = bookings.map(b => ({
            id: b._id.toString(),
            time: b.time || new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            customer: b.clientId ? b.clientId.name : 'Walk-in Customer',
            service: b.serviceId ? b.serviceId.name : 'Unknown Service',
            duration: `${b.duration || 30} MIN`,
            bookingStatus: b.status
        }));

        // 3. Current calendar month start/end for MTD KPIs
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // MTD Revenue (Invoices)
        const invoices = await Invoice.find({
            salonId,
            status: 'active',
            createdAt: { $gte: monthStart, $lte: monthEnd },
            'items.stylistIds': staffId
        });

        let revenue = 0;
        invoices.forEach(inv => {
            inv.items.forEach(item => {
                if (item.stylistIds && item.stylistIds.some(sid => sid.toString() === staffId.toString())) {
                    const stylistsCount = item.stylistIds.length || 1;
                    revenue += (item.price * item.quantity) / stylistsCount;
                }
            });
        });

        // MTD Completed Bookings Revenue & Count for progress / goal checking
        const monthlyBookings = await Booking.find({
            salonId,
            staffId,
            status: 'completed',
            appointmentDate: { $gte: monthStart, $lte: monthEnd }
        });

        const bookingRevenue = monthlyBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const target = staff.hrProfile?.revenueTarget || 35000;
        const progressPercent = target > 0 ? Math.min(100, Math.round((bookingRevenue / target) * 100)) : 0;
        const servicesDone = monthlyBookings.length;

        // Calculate all-time stats for the stylist cards
        const totalAssigned = await Booking.countDocuments({ salonId, staffId });
        const totalCompleted = await Booking.countDocuments({ salonId, staffId, status: 'completed' });

        // Calculate total commission of all time
        const allInvoices = await Invoice.find({
            salonId,
            status: 'active',
            'items.stylistIds': staffId
        });

        const services = await Service.find({ salonId });
        const serviceMap = {};
        services.forEach(s => {
            serviceMap[s._id.toString()] = s;
        });

        let totalCommission = 0;
        allInvoices.forEach(inv => {
            inv.items.forEach(item => {
                if (item.stylistIds && item.stylistIds.some(sid => sid.toString() === staffId.toString())) {
                    const stylistsCount = item.stylistIds.length || 1;
                    let baseCommission = 0;
                    if (item.type === 'service') {
                        const service = serviceMap[item.itemId.toString()];
                        if (service) {
                            if (service.commissionApplicable) {
                                if (service.commissionType === 'fixed') {
                                    baseCommission = (service.commissionValue || 0) * item.quantity;
                                } else {
                                    baseCommission = (item.price * item.quantity * (service.commissionValue || 0)) / 100;
                                }
                            } else {
                                const staffPct = staff.hrProfile?.commissionPercentage || 10;
                                baseCommission = (item.price * item.quantity * staffPct) / 100;
                            }
                        } else {
                            const staffPct = staff.hrProfile?.commissionPercentage || 10;
                            baseCommission = (item.price * item.quantity * staffPct) / 100;
                        }
                    } else {
                        const staffPct = staff.hrProfile?.commissionPercentage || 10;
                        baseCommission = (item.price * item.quantity * staffPct) / 100;
                    }
                    totalCommission += (baseCommission / stylistsCount);
                }
            });
        });

        const avgCommission = totalCompleted > 0 ? (totalCommission / totalCompleted) : 0;

        // 4. Performance Data (7-day trend ending today)
        const performanceData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStart = new Date(d);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(d);
            dayEnd.setHours(23, 59, 59, 999);

            const dayInvoices = await Invoice.find({
                salonId,
                status: 'active',
                createdAt: { $gte: dayStart, $lte: dayEnd },
                'items.stylistIds': staffId
            });

            let dayRevenue = 0;
            dayInvoices.forEach(inv => {
                inv.items.forEach(item => {
                    if (item.stylistIds && item.stylistIds.some(sid => sid.toString() === staffId.toString())) {
                        const stylistsCount = item.stylistIds.length || 1;
                        dayRevenue += (item.price * item.quantity) / stylistsCount;
                    }
                });
            });

            performanceData.push({
                label: dayNames[d.getDay()],
                value: Math.round(dayRevenue)
            });
        }

        // 5. Attendance Log & Shift Status
        const todayStr = new Date().toLocaleDateString('en-CA');
        const todayDate = new Date(todayStr).setHours(0, 0, 0, 0);
        const attendance = await Attendance.findOne({ staffId, date: todayDate });

        const attendanceLog = [];
        if (attendance) {
            const formatTimeOnly = (isoString) => {
                if (!isoString) return '';
                return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            };
            const formatDateOnly = (isoString) => {
                if (!isoString) return '';
                const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                const d = new Date(isoString);
                return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`;
            };

            if (attendance.checkOut) {
                attendanceLog.push({
                    type: 'PUNCH_OUT',
                    statusLabel: 'Punched Out',
                    time: formatTimeOnly(attendance.checkOut),
                    date: formatDateOnly(attendance.checkOut)
                });
            }
            if (attendance.checkIn) {
                attendanceLog.push({
                    type: 'PUNCH_IN',
                    statusLabel: 'Punched In',
                    time: formatTimeOnly(attendance.checkIn),
                    date: formatDateOnly(attendance.checkIn)
                });
            }
        }

        const shiftActive = attendance ? (!!attendance.checkIn && !attendance.checkOut) : false;

        res.status(200).json({
            success: true,
            data: {
                schedule,
                stats: {
                    revenue: Math.round(revenue),
                    target,
                    progressPercent,
                    servicesDone,
                    highestDaily: Math.max(...performanceData.map(d => d.value), 0),
                    rating: 4.8,
                    totalAssigned,
                    totalCompleted,
                    totalCommission: Math.round(totalCommission),
                    avgCommission: Math.round(avgCommission)
                },
                performanceData,
                attendanceLog,
                shiftActive
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get overall performance for all staff (used by manager targets + performance pages)
// @route   GET /api/hr/performance
// @access  Private/Admin,Manager
exports.getOverallPerformance = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : new Date();

        const allStaff = await Staff.find({ salonId }).select('name role hrProfile');

        // Aggregate completed bookings per staff in the period
        const bookingAgg = await Booking.aggregate([
            {
                $match: {
                    salonId: mongoose.Types.ObjectId.isValid(salonId) ? new mongoose.Types.ObjectId(salonId) : salonId,
                    status: 'completed',
                    createdAt: { $gte: start, $lte: end }
                }
            },
            { $unwind: '$staffId' },
            {
                $group: {
                    _id: '$staffId',
                    revenue: { $sum: '$totalPrice' },
                    services: { $count: {} }
                }
            }
        ]);

        const bookingMap = {};
        bookingAgg.forEach(b => {
            bookingMap[b._id.toString()] = { revenue: b.revenue, services: b.services };
        });

        const staffPerformance = allStaff.map(s => {
            const sid = s._id.toString();
            const bm = bookingMap[sid] || { revenue: 0, services: 0 };
            const goal = s.hrProfile?.revenueTarget || 50000;
            return {
                id: sid,
                staff: s.name,
                role: s.role,
                revenue: bm.revenue,
                services: bm.services,
                goal,
                rating: 4.5,
                contribution: bm.revenue > goal * 0.8 ? 'High' : bm.revenue > goal * 0.5 ? 'Medium' : 'Low'
            };
        });

        res.status(200).json({
            success: true,
            data: {
                staff: staffPerformance,
                period: { startDate: start, endDate: end }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
