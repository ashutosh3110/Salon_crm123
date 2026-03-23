import mongoose from 'mongoose';
import PettyCashEntry from './pettyCashEntry.model.js';
import PettyCashClosing from './pettyCashClosing.model.js';

export const PETTY_CASH_CATEGORIES = [
    'Staff Refreshment',
    'Cleaning Supplies',
    'Office & Stationery',
    'Transport / Conveyance',
    'Repair & Maintenance',
    'Miscellaneous',
];

export const PETTY_DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

function toObjectId(id) {
    if (!id) return null;
    try {
        return new mongoose.Types.ObjectId(String(id));
    } catch {
        return null;
    }
}

function todayUtcDateString() {
    return new Date().toISOString().split('T')[0];
}

function assertTenant(tenantId) {
    const tid = toObjectId(tenantId);
    if (!tid) {
        const err = new Error('Tenant context required');
        err.statusCode = 400;
        throw err;
    }
    return tid;
}

async function computeBalance(tid) {
    const [row] = await PettyCashEntry.aggregate([
        { $match: { tenantId: tid } },
        {
            $group: {
                _id: null,
                balance: {
                    $sum: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$type', 'FUND_ADDED'] }, then: '$amount' },
                                { case: { $eq: ['$type', 'EXPENSE'] }, then: { $multiply: ['$amount', -1] } },
                            ],
                            default: 0,
                        },
                    },
                },
            },
        },
    ]);
    return row?.balance != null ? Number(row.balance) : 0;
}

function mapEntry(doc) {
    const o = doc.toObject ? doc.toObject() : doc;
    return {
        id: String(o._id),
        type: o.type,
        amount: Number(o.amount) || 0,
        category: o.category || '',
        description: o.description || '',
        staff: o.staff || '',
        date: o.businessDate,
        timestamp: (o.createdAt || o.updatedAt || new Date()).toISOString(),
        attachment: o.attachment || null,
    };
}

function mapClosing(doc) {
    const o = doc.toObject ? doc.toObject() : doc;
    const den = o.denominations && typeof o.denominations === 'object' ? o.denominations : {};
    return {
        id: String(o._id),
        date: o.businessDate,
        timestamp: (o.createdAt || new Date()).toISOString(),
        openingBalance: Number(o.openingBalance) || 0,
        closingBalance: Number(o.closingBalance) || 0,
        discrepancy: Number(o.discrepancy) || 0,
        denominations: den,
        verifiedBy: o.verifiedBy || '',
    };
}

async function getSummary(tenantId) {
    const tid = assertTenant(tenantId);
    const businessDate = todayUtcDateString();

    const [balance, opened, closed, inflowAgg, outflowAgg] = await Promise.all([
        computeBalance(tid),
        PettyCashEntry.countDocuments({ tenantId: tid, businessDate, type: 'DAY_OPEN' }),
        PettyCashClosing.countDocuments({ tenantId: tid, businessDate }),
        PettyCashEntry.aggregate([
            {
                $match: {
                    tenantId: tid,
                    businessDate,
                    type: 'FUND_ADDED',
                },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        PettyCashEntry.aggregate([
            {
                $match: {
                    tenantId: tid,
                    businessDate,
                    type: 'EXPENSE',
                },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
    ]);

    return {
        businessDate,
        balance,
        categories: PETTY_CASH_CATEGORIES,
        denominations: PETTY_DENOMINATIONS,
        isOpenedToday: opened > 0,
        isClosedToday: closed > 0,
        todayInflow: inflowAgg[0]?.total != null ? Number(inflowAgg[0].total) : 0,
        todayOutflow: outflowAgg[0]?.total != null ? Number(outflowAgg[0].total) : 0,
    };
}

async function listEntries(tenantId, query = {}) {
    const tid = assertTenant(tenantId);
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(query.limit, 10) || 100));
    const skip = (page - 1) * limit;

    const filter = { tenantId: tid };
    if (query.businessDate) {
        filter.businessDate = String(query.businessDate);
    } else if (query.startDate || query.endDate) {
        filter.businessDate = {};
        if (query.startDate) filter.businessDate.$gte = String(query.startDate);
        if (query.endDate) filter.businessDate.$lte = String(query.endDate);
    }

    const [rows, totalResults] = await Promise.all([
        PettyCashEntry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        PettyCashEntry.countDocuments(filter),
    ]);

    return {
        results: rows.map((r) => mapEntry(r)),
        page,
        limit,
        totalResults,
        totalPages: Math.ceil(totalResults / limit) || 1,
    };
}

async function listClosings(tenantId, query = {}) {
    const tid = assertTenant(tenantId);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 30));
    const rows = await PettyCashClosing.find({ tenantId: tid }).sort({ businessDate: -1 }).limit(limit).lean();
    return { results: rows.map((r) => mapClosing(r)) };
}

async function assertDayOpenNotClosed(tid, businessDate) {
    const closed = await PettyCashClosing.findOne({ tenantId: tid, businessDate }).lean();
    if (closed) {
        const err = new Error('Petty cash is closed for this day');
        err.statusCode = 400;
        throw err;
    }
    const opened = await PettyCashEntry.findOne({ tenantId: tid, businessDate, type: 'DAY_OPEN' }).lean();
    if (!opened) {
        const err = new Error('Open the day before recording petty cash movements');
        err.statusCode = 400;
        throw err;
    }
}

async function openDay(tenantId, body = {}) {
    const tid = assertTenant(tenantId);
    const businessDate = todayUtcDateString();
    const staff = String(body.staffName || body.staff || 'Manager').trim() || 'Manager';

    const closed = await PettyCashClosing.findOne({ tenantId: tid, businessDate }).lean();
    if (closed) {
        const err = new Error('Day is already closed. Open a new session tomorrow.');
        err.statusCode = 400;
        throw err;
    }

    const existing = await PettyCashEntry.findOne({ tenantId: tid, businessDate, type: 'DAY_OPEN' }).lean();
    if (existing) {
        const err = new Error('Day session already initialized');
        err.statusCode = 400;
        throw err;
    }

    const doc = await PettyCashEntry.create({
        tenantId: tid,
        type: 'DAY_OPEN',
        businessDate,
        amount: 0,
        category: 'System',
        description: 'Day Opened',
        staff,
    });

    const summary = await getSummary(tenantId);
    return { entry: mapEntry(doc), summary };
}

async function addFund(tenantId, body = {}) {
    const tid = assertTenant(tenantId);
    const businessDate = todayUtcDateString();
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        const err = new Error('amount must be a positive number');
        err.statusCode = 400;
        throw err;
    }
    const source = String(body.source || body.givenBy || 'Owner').trim() || 'Owner';
    const description = String(body.description || `Fund injection from ${source}`).trim();

    await assertDayOpenNotClosed(tid, businessDate);

    const doc = await PettyCashEntry.create({
        tenantId: tid,
        type: 'FUND_ADDED',
        businessDate,
        amount,
        category: 'Top-Up',
        description,
        staff: source,
    });

    const summary = await getSummary(tenantId);
    return { entry: mapEntry(doc), summary };
}

async function addExpense(tenantId, body = {}) {
    const tid = assertTenant(tenantId);
    const businessDate = todayUtcDateString();
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        const err = new Error('amount must be a positive number');
        err.statusCode = 400;
        throw err;
    }
    const category = String(body.category || 'Miscellaneous').trim();
    const description = String(body.description || '').trim();
    if (!description) {
        const err = new Error('description is required');
        err.statusCode = 400;
        throw err;
    }
    const staff = String(body.staff || 'Staff').trim() || 'Staff';
    const attachment = body.attachment != null ? String(body.attachment) : null;

    await assertDayOpenNotClosed(tid, businessDate);

    const balance = await computeBalance(tid);
    if (amount > balance) {
        const err = new Error('Insufficient petty cash balance');
        err.statusCode = 400;
        throw err;
    }

    const doc = await PettyCashEntry.create({
        tenantId: tid,
        type: 'EXPENSE',
        businessDate,
        amount,
        category,
        description,
        staff,
        attachment: attachment || undefined,
    });

    const summary = await getSummary(tenantId);
    return { entry: mapEntry(doc), summary };
}

function physicalTotalFromDenominations(raw) {
    if (!raw || typeof raw !== 'object') return 0;
    let total = 0;
    for (const [denom, count] of Object.entries(raw)) {
        const d = Number(denom);
        const c = Number(count);
        if (Number.isFinite(d) && Number.isFinite(c) && c > 0) total += d * c;
    }
    return total;
}

async function closeDay(tenantId, body = {}) {
    const tid = assertTenant(tenantId);
    const businessDate = todayUtcDateString();

    const closed = await PettyCashClosing.findOne({ tenantId: tid, businessDate }).lean();
    if (closed) {
        const err = new Error('Day already closed');
        err.statusCode = 400;
        throw err;
    }

    const opened = await PettyCashEntry.findOne({ tenantId: tid, businessDate, type: 'DAY_OPEN' }).lean();
    if (!opened) {
        const err = new Error('Open the day before closing');
        err.statusCode = 400;
        throw err;
    }

    const systemBalance = await computeBalance(tid);
    const denominations = body.denominations && typeof body.denominations === 'object' ? body.denominations : {};
    const physicalTotal = physicalTotalFromDenominations(denominations);
    if (physicalTotal <= 0) {
        const err = new Error('Enter counted notes/coins (physical total must be greater than zero)');
        err.statusCode = 400;
        throw err;
    }

    const discrepancy = physicalTotal - systemBalance;
    const verifiedBy = String(body.verifiedBy || body.verifiedByName || 'Manager').trim() || 'Manager';

    const doc = await PettyCashClosing.create({
        tenantId: tid,
        businessDate,
        openingBalance: systemBalance,
        closingBalance: physicalTotal,
        discrepancy,
        denominations,
        verifiedBy,
    });

    const summary = await getSummary(tenantId);
    return { closing: mapClosing(doc), summary };
}

export default {
    getSummary,
    listEntries,
    listClosings,
    openDay,
    addFund,
    addExpense,
    closeDay,
    PETTY_CASH_CATEGORIES,
    PETTY_DENOMINATIONS,
};
