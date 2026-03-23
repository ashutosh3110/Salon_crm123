import mongoose from 'mongoose';
import httpStatus from 'http-status-codes';
import PayrollPeriod from './payrollPeriod.model.js';
import PayrollEntry from './payrollEntry.model.js';
import User from '../user/user.model.js';

function toOid(id) {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        return null;
    }
}

function computeNetValues(baseSalary, commission, deductions) {
    const n = Number(baseSalary || 0) + Number(commission || 0) - Number(deductions || 0);
    return Math.max(0, Math.round(n * 100) / 100);
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
        const netPay = computeNetValues(baseSalary, 0, 0);
        await PayrollEntry.create({
            tenantId: tid,
            year,
            month,
            userId: u._id,
            baseSalary,
            commission: 0,
            deductions: 0,
            netPay,
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
    if (body.deductions !== undefined) entry.deductions = Number(body.deductions);
    if (body.workingDays !== undefined) entry.workingDays = Number(body.workingDays);
    if (body.status !== undefined) entry.status = body.status;
    entry.netPay = computeNetValues(entry.baseSalary, entry.commission, entry.deductions);
    await entry.save();

    return PayrollEntry.findById(entry._id)
        .populate('userId', 'name email role salary bankName bankAccountNo ifsc')
        .lean();
};

const markAllPaid = async (tenantId, year, month) => {
    await assertPeriodUnlocked(tenantId, year, month);
    const tid = toOid(tenantId);
    await PayrollEntry.updateMany(
        { tenantId: tid, year, month, status: { $ne: 'paid' } },
        { $set: { status: 'paid' } }
    );
    return getMonthData(tenantId, year, month);
};

export default {
    getMonthData,
    setPeriodLocked,
    generateEntries,
    updateEntry,
    markAllPaid,
};
