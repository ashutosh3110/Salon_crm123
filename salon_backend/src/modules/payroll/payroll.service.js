import mongoose from 'mongoose';
import httpStatus from 'http-status-codes';
import PayrollPeriod from './payrollPeriod.model.js';
import PayrollEntry from './payrollEntry.model.js';
import User from '../user/user.model.js';
import Commission from '../hr/commission.model.js';
import Attendance from '../attendance/attendance.model.js';
import Transaction from '../finance/transaction.model.js';

function toOid(id) {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        return null;
    }
}

function computeNetValues(entry) {
    const base = Number(entry.baseSalary || 0);
    const comm = Number(entry.commission || 0);
    const inc = Number(entry.incentive || 0);
    const ded = Number(entry.deductions || 0);
    const adv = entry.deductAdvance ? Number(entry.advance || 0) : 0;
    const attDed = Number(entry.attendanceDeduction || 0);
    return Math.max(0, Math.round((base + comm + inc - ded - adv - attDed) * 100) / 100);
}

async function getOrCreatePeriod(tenantId, year, month) {
    const tid = toOid(tenantId);
    let p = await PayrollPeriod.findOne({ tenantId: tid, year, month });
    if (!p) {
        p = await PayrollPeriod.create({ tenantId: tid, year, month, locked: false });
    }
    return p;
}

async function assertPeriodUnlocked(tenantId, year, month) {
    const tid = toOid(tenantId);
    const p = await PayrollPeriod.findOne({ tenantId: tid, year, month });
    if (p?.locked) {
        const err = new Error('Payroll for this month is locked');
        err.statusCode = httpStatus.CONFLICT;
        throw err;
    }
}

const getMonthData = async (tenantId, year, month) => {
    const tid = toOid(tenantId);
    const period = await PayrollPeriod.findOne({ tenantId: tid, year, month }).lean();
    const entries = await PayrollEntry.find({ tenantId: tid, year, month })
        .populate('userId', 'name email role salary bankName bankAccountNo ifsc')
        .sort({ createdAt: 1 })
        .lean();
    return {
        period: { year, month, locked: period?.locked || false },
        entries,
    };
};

const setPeriodLocked = async (tenantId, year, month, locked) => {
    await getOrCreatePeriod(tenantId, year, month);
    const tid = toOid(tenantId);
    const p = await PayrollPeriod.findOneAndUpdate(
        { tenantId: tid, year, month },
        { $set: { locked: !!locked } },
        { new: true }
    ).lean();
    return { year, month, locked: p.locked };
};

const generateEntries = async (tenantId, year, month) => {
    await assertPeriodUnlocked(tenantId, year, month);
    await getOrCreatePeriod(tenantId, year, month);
    const tid = toOid(tenantId);

    const users = await User.find({
        tenantId: tid,
        role: { $nin: ['superadmin'] },
        status: 'active',
    }).lean();

    for (const u of users) {
        const exists = await PayrollEntry.exists({ tenantId: tid, year, month, userId: u._id });
        if (exists) continue;
        const baseSalary = Number(u.salary || 0);
        await PayrollEntry.create({
            tenantId: tid,
            year,
            month,
            userId: u._id,
            baseSalary,
            commission: 0,
            incentive: 0,
            advance: 0,
            deductAdvance: false,
            deductions: 0,
            attendanceDays: 0,
            absentDays: 0,
            attendanceDeduction: 0,
            workingDays: 30,
            status: 'draft',
            bankName: u.bankName || '',
            bankAccountNo: u.bankAccountNo || '',
            ifsc: u.ifsc || '',
        });
    }

    return getMonthData(tenantId, year, month);
};

const updateEntry = async (tenantId, entryId, body) => {
    const tid = toOid(tenantId);
    const eid = toOid(entryId);
    const entry = await PayrollEntry.findOne({ _id: eid, tenantId: tid });
    if (!entry) {
        const err = new Error('Payroll entry not found');
        err.statusCode = httpStatus.NOT_FOUND;
        throw err;
    }
    await assertPeriodUnlocked(tenantId, entry.year, entry.month);

    if (body.baseSalary !== undefined) entry.baseSalary = Number(body.baseSalary);
    if (body.commission !== undefined) entry.commission = Number(body.commission);
    if (body.incentive !== undefined) entry.incentive = Number(body.incentive);
    if (body.advance !== undefined) entry.advance = Number(body.advance);
    if (body.deductAdvance !== undefined) entry.deductAdvance = !!body.deductAdvance;
    if (body.deductions !== undefined) entry.deductions = Number(body.deductions);
    if (body.workingDays !== undefined) entry.workingDays = Number(body.workingDays);
    if (body.status !== undefined) entry.status = body.status;
    entry.netPay = computeNetValues(entry);
    await entry.save();

    return PayrollEntry.findById(entry._id)
        .populate('userId', 'name email role salary bankName bankAccountNo ifsc')
        .lean();
};

// ── Sync Commissions from Commission model ──
const syncCommissions = async (tenantId, year, month) => {
    await assertPeriodUnlocked(tenantId, year, month);
    const tid = toOid(tenantId);

    // Date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const entries = await PayrollEntry.find({ tenantId: tid, year, month });

    let synced = 0;
    for (const entry of entries) {
        // Sum commissions for this staff in this month
        const result = await Commission.aggregate([
            {
                $match: {
                    tenantId: tid,
                    staffId: entry.userId,
                    status: { $in: ['pending', 'paid'] },
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const totalCommission = result[0]?.total || 0;
        if (totalCommission > 0 || entry.commission !== totalCommission) {
            entry.commission = Math.round(totalCommission * 100) / 100;
            entry.netPay = computeNetValues(entry);
            await entry.save();
            synced++;
        }
    }

    return { synced, ...(await getMonthData(tenantId, year, month)) };
};

// ── Sync Attendance: calculate absent days and deductions ──
const syncAttendance = async (tenantId, year, month) => {
    await assertPeriodUnlocked(tenantId, year, month);
    const tid = toOid(tenantId);

    const entries = await PayrollEntry.find({ tenantId: tid, year, month });
    const daysInMonth = new Date(year, month, 0).getDate();

    let synced = 0;
    for (const entry of entries) {
        // Count present/late/half-day days
        const attendanceRecords = await Attendance.find({
            tenantId: tid,
            userId: entry.userId,
            date: { $regex: `^${year}-${String(month).padStart(2, '0')}` },
        }).lean();

        let presentDays = 0;
        for (const rec of attendanceRecords) {
            if (rec.status === 'present' || rec.status === 'late') presentDays += 1;
            else if (rec.status === 'half-day') presentDays += 0.5;
        }

        const expectedDays = entry.workingDays || 25;
        const absentDays = Math.max(0, expectedDays - presentDays);
        const perDaySalary = expectedDays > 0 ? (entry.baseSalary / expectedDays) : 0;
        const attendanceDeduction = Math.round(absentDays * perDaySalary);

        entry.attendanceDays = presentDays;
        entry.absentDays = absentDays;
        entry.attendanceDeduction = attendanceDeduction;
        entry.netPay = computeNetValues(entry);
        await entry.save();
        synced++;
    }

    return { synced, ...(await getMonthData(tenantId, year, month)) };
};

const markAllPaid = async (tenantId, year, month) => {
    await assertPeriodUnlocked(tenantId, year, month);
    const tid = toOid(tenantId);

    const entries = await PayrollEntry.find({ tenantId: tid, year, month, status: { $ne: 'paid' } });

    for (const entry of entries) {
        entry.status = 'paid';
        await entry.save();

        // Auto-create salary expense in Transaction
        const userName = await User.findById(entry.userId).select('name').lean();
        await Transaction.create({
            tenantId: tid,
            type: 'expense',
            amount: entry.netPay,
            category: 'salary',
            paymentMethod: 'online',
            description: `Salary - ${userName?.name || 'Staff'} (${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month-1]} ${year})`,
            date: new Date(),
        });
    }

    return getMonthData(tenantId, year, month);
};

export default {
    getMonthData,
    setPeriodLocked,
    generateEntries,
    updateEntry,
    markAllPaid,
    syncCommissions,
    syncAttendance,
};
