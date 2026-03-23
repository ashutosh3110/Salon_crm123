import mongoose from 'mongoose';
import Invoice from '../invoice/invoice.model.js';
import Transaction from './transaction.model.js';
import CashBankReconciliation from './cashBankReconciliation.model.js';
import EndOfDay from './endOfDay.model.js';

function toObjectId(id) {
    if (!id) return null;
    try {
        return new mongoose.Types.ObjectId(String(id));
    } catch {
        return null;
    }
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

function utcDayBounds(isoDateStr) {
    const start = new Date(`${isoDateStr}T00:00:00.000Z`);
    const end = new Date(`${isoDateStr}T23:59:59.999Z`);
    return { start, end };
}

async function aggregateDayMetrics(tid, businessDate) {
    const { start, end } = utcDayBounds(businessDate);

    const [inv, exp] = await Promise.all([
        Invoice.aggregate([
            {
                $match: {
                    tenantId: tid,
                    paymentStatus: { $in: ['paid', 'partially_paid'] },
                    createdAt: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$total' },
                    cashSales: {
                        $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$total', 0] },
                    },
                    cardSales: {
                        $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, '$total', 0] },
                    },
                    onlineSales: {
                        $sum: { $cond: [{ $eq: ['$paymentMethod', 'online'] }, '$total', 0] },
                    },
                    invoiceCount: { $sum: 1 },
                },
            },
        ]),
        Transaction.aggregate([
            {
                $match: {
                    tenantId: tid,
                    type: 'expense',
                    createdAt: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: null,
                    expenseTotal: { $sum: '$amount' },
                    cashExpenses: {
                        $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$amount', 0] },
                    },
                    bankExpenses: {
                        $sum: {
                            $cond: [
                                { $in: ['$paymentMethod', ['card', 'online']] },
                                '$amount',
                                0,
                            ],
                        },
                    },
                },
            },
        ]),
    ]);

    const i = inv[0] || {};
    const e = exp[0] || {};

    const totalSales = Math.round((i.totalSales || 0) * 100) / 100;
    const cashSales = Math.round((i.cashSales || 0) * 100) / 100;
    const cardSales = Math.round((i.cardSales || 0) * 100) / 100;
    const onlineSales = Math.round((i.onlineSales || 0) * 100) / 100;
    const dailyExpenses = Math.round((e.expenseTotal || 0) * 100) / 100;
    const cashExpenses = Math.round((e.cashExpenses || 0) * 100) / 100;
    const bankExpenses = Math.round((e.bankExpenses || 0) * 100) / 100;

    const netForDay = Math.round((totalSales - dailyExpenses) * 100) / 100;
    const netCashEstimate = Math.round((cashSales - cashExpenses) * 100) / 100;

    return {
        businessDate,
        totalSales,
        dailyExpenses,
        netForDay,
        cashSales,
        cardSales,
        onlineSales,
        cashExpenses,
        bankExpenses,
        netCashEstimate,
        invoiceCount: i.invoiceCount || 0,
    };
}

async function getSummary(tenantId, query = {}) {
    const tid = assertTenant(tenantId);
    const businessDate =
        query.date && /^\d{4}-\d{2}-\d{2}$/.test(String(query.date))
            ? String(query.date)
            : new Date().toISOString().split('T')[0];

    const [metrics, closure, cashBank] = await Promise.all([
        aggregateDayMetrics(tid, businessDate),
        EndOfDay.findOne({ tenantId: tid, businessDate }).lean(),
        CashBankReconciliation.findOne({ tenantId: tid, businessDate }).lean(),
    ]);

    const reconciled = {
        cashBankSaved: !!cashBank,
        cashBankLocked: !!cashBank?.locked,
    };

    return {
        businessDate,
        dayClosed: !!closure,
        closure: closure
            ? {
                  id: String(closure._id),
                  closedAt: closure.createdAt,
                  closedByName: closure.closedByName || '',
                  notes: closure.notes || '',
                  snapshot: closure.snapshot || {},
              }
            : null,
        metrics,
        reconciled,
        meta: {
            netCashHint:
                'Net cash estimate = cash sales − cash expenses (ledger). Physical count is Cash & Bank screen.',
        },
    };
}

async function closeDay(tenantId, body = {}, user = {}) {
    const tid = assertTenant(tenantId);
    const businessDate =
        body.businessDate && /^\d{4}-\d{2}-\d{2}$/.test(String(body.businessDate))
            ? String(body.businessDate)
            : new Date().toISOString().split('T')[0];

    const existing = await EndOfDay.findOne({ tenantId: tid, businessDate }).lean();
    if (existing) {
        const err = new Error('This day is already closed. EOD cannot be repeated.');
        err.statusCode = 400;
        throw err;
    }

    const metrics = await aggregateDayMetrics(tid, businessDate);
    const notes = body.notes != null ? String(body.notes).trim() : '';

    const uid = user._id || user.id;
    const closedByUserId = uid ? toObjectId(uid) : undefined;
    const closedByName = String(user.name || user.email || 'Admin').trim() || 'Admin';

    const doc = await EndOfDay.create({
        tenantId: tid,
        businessDate,
        closedByUserId,
        closedByName,
        notes,
        snapshot: { ...metrics },
    });

    const summary = await getSummary(tenantId, { date: businessDate });

    return {
        closure: {
            id: String(doc._id),
            businessDate: doc.businessDate,
            closedByName: doc.closedByName,
            notes: doc.notes,
            snapshot: doc.snapshot,
            createdAt: doc.createdAt,
        },
        summary,
    };
}

async function listHistory(tenantId, query = {}) {
    const tid = assertTenant(tenantId);
    const limit = Math.min(60, Math.max(1, parseInt(query.limit, 10) || 20));
    const rows = await EndOfDay.find({ tenantId: tid }).sort({ businessDate: -1 }).limit(limit).lean();

    return {
        results: rows.map((r) => ({
            id: String(r._id),
            businessDate: r.businessDate,
            closedByName: r.closedByName,
            notes: r.notes,
            snapshot: r.snapshot,
            createdAt: r.createdAt,
        })),
    };
}

export default {
    getSummary,
    closeDay,
    listHistory,
};
