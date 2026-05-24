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
                    filter: { staffId: item.staffId, date: new Date(date).setHours(0,0,0,0) },
                    update: { 
                        staffId: item.staffId, 
                        salonId, 
                        date: new Date(date).setHours(0,0,0,0), 
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
                summary[sid] = { present: 0, absent: 0, halfDay: 0, leave: 0, late: 0, total: 0 };
            }
            summary[sid][log.status === 'half-day' ? 'halfDay' : log.status]++;
            summary[sid].total++;
        });

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
            query.date = new Date(date).setHours(0,0,0,0);
        } else if (startDate && endDate) {
            query.date = { 
                $gte: new Date(startDate).setHours(0,0,0,0), 
                $lte: new Date(endDate).setHours(23,59,59,999) 
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
            const perDaySalary = baseSalary / (workingDays || 30);
            const earnedSalary = perDaySalary * (presentDays || 0);
            const netSalary = Math.round(
                earnedSalary + 
                (Number(incentive) || 0) + 
                (Number(overtime) || 0) - 
                (Number(pf) || 0) - 
                (Number(tax) || 0) - 
                (Number(otherDeductions) || 0)
            );

            const payroll = await Payroll.findOneAndUpdate(
                { staffId, month, year },
                { 
                    staffId, 
                    salonId, 
                    month, 
                    year, 
                    baseSalary,
                    workingDays: workingDays || 30,
                    presentDays: presentDays || 0,
                    leaveDays: leaveDays || 0,
                    incentive: Number(incentive) || 0,
                    overtime: Number(overtime) || 0,
                    pf: Number(pf) || 0,
                    tax: Number(tax) || 0,
                    otherDeductions: Number(otherDeductions) || 0,
                    netSalary,
                    notes,
                    status: status || 'draft',
                    performedBy: req.user._id
                },
                { new: true, upsert: true }
            );
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
            const perDay = salary / totalDaysInMonth;
            const earned = Math.round(effectivePresent * perDay);

            const payroll = await Payroll.findOneAndUpdate(
                { staffId: staff._id, month, year },
                { 
                    staffId: staff._id, 
                    salonId, 
                    month, 
                    year, 
                    baseSalary: salary,
                    workingDays: totalDaysInMonth,
                    presentDays: effectivePresent,
                    leaveDays: leaveCount,
                    netSalary: earned,
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


