import mongoose from 'mongoose';
import Invoice from '../invoice/invoice.model.js';
import Transaction from './transaction.model.js';
import CashBankReconciliation from './cashBankReconciliation.model.js';

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

function previousBusinessDate(isoDateStr) {
    const d = new Date(`${isoDateStr}T12:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split('T')[0];
}

async function aggregateInvoiceSales(tid, start, end) {
    const [row] = await Invoice.aggregate([
        {
            $match: {
                tenantId: tid,
                /** Only settled POS sales count toward drawer / bank */
                paymentStatus: { $in: ['paid', 'partially_paid'] },
                createdAt: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: null,
                cashSales: {
                    $sum: {
                        $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$total', 0],
                    },
                },
                bankSales: {
                    $sum: {
                        $cond: [
                            {
                                $in: ['$paymentMethod', ['card', 'online']],
                            },
                            '$total',
                            0,
                        ],
                    },
                },
            },
        },
    ]);
    return {
        cashSales: Math.round((row?.cashSales || 0) * 100) / 100,
        bankSales: Math.round((row?.bankSales || 0) * 100) / 100,
    };
}

async function aggregateExpenseByPayment(tid, start, end) {
    const [row] = await Transaction.aggregate([
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
                cashExpenses: {
                    $sum: {
                        $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$amount', 0],
                    },
                },
                bankExpenses: {
                    $sum: {
                        $cond: [
                            {
                                $in: ['$paymentMethod', ['card', 'online']],
                            },
                            '$amount',
                            0,
                        ],
                    },
                },
            },
        },
    ]);
    return {
        cashExpenses: Math.round((row?.cashExpenses || 0) * 100) / 100,
        bankExpenses: Math.round((row?.bankExpenses || 0) * 100) / 100,
    };
}

async function getSummary(tenantId, query = {}) {
    const tid = assertTenant(tenantId);
    const businessDate =
        query.date && /^\d{4}-\d{2}-\d{2}$/.test(String(query.date))
            ? String(query.date)
            : new Date().toISOString().split('T')[0];

    const { start, end } = utcDayBounds(businessDate);
    const prev = previousBusinessDate(businessDate);

    const [prevSave, inv, exp, todaySave] = await Promise.all([
        CashBankReconciliation.findOne({ tenantId: tid, businessDate: prev }).lean(),
        aggregateInvoiceSales(tid, start, end),
        aggregateExpenseByPayment(tid, start, end),
        CashBankReconciliation.findOne({ tenantId: tid, businessDate }).lean(),
    ]);

    const openingCash = prevSave?.actualCash != null ? Number(prevSave.actualCash) : 0;
    const openingBank = prevSave?.actualBank != null ? Number(prevSave.actualBank) : 0;

    const cashNet = openingCash + inv.cashSales - exp.cashExpenses;
    const bankNet = openingBank + inv.bankSales - exp.bankExpenses;

    return {
        businessDate,
        previousBusinessDate: prev,
        cash: {
            opening: Math.round(openingCash * 100) / 100,
            sales: inv.cashSales,
            expenses: exp.cashExpenses,
            net: Math.round(cashNet * 100) / 100,
        },
        bank: {
            opening: Math.round(openingBank * 100) / 100,
            sales: inv.bankSales,
            expenses: exp.bankExpenses,
            net: Math.round(bankNet * 100) / 100,
        },
        saved: todaySave
            ? {
                  actualCash: todaySave.actualCash,
                  actualBank: todaySave.actualBank,
                  notes: todaySave.notes || '',
                  locked: !!todaySave.locked,
                  updatedAt: todaySave.updatedAt,
              }
            : null,
        meta: {
            invoiceCashLabel: 'Cash sales (POS)',
            invoiceBankLabel: 'Card & online sales (POS)',
            expenseCashLabel: 'Cash expenses (ledger)',
            expenseBankLabel: 'Card & online expenses (ledger)',
        },
    };
}

async function saveReconciliation(tenantId, body = {}) {
    const tid = assertTenant(tenantId);
    const businessDate =
        body.businessDate && /^\d{4}-\d{2}-\d{2}$/.test(String(body.businessDate))
            ? String(body.businessDate)
            : new Date().toISOString().split('T')[0];

    const actualCash = body.actualCash != null ? Number(body.actualCash) : null;
    const actualBank = body.actualBank != null ? Number(body.actualBank) : null;

    if (actualCash == null || Number.isNaN(actualCash) || actualBank == null || Number.isNaN(actualBank)) {
        const err = new Error('actualCash and actualBank are required numbers');
        err.statusCode = 400;
        throw err;
    }

    const notes = body.notes != null ? String(body.notes).trim() : '';
    const locked = !!body.locked;

    const doc = await CashBankReconciliation.findOneAndUpdate(
        { tenantId: tid, businessDate },
        {
            $set: {
                actualCash,
                actualBank,
                notes,
                locked,
            },
        },
        { new: true, upsert: true, runValidators: true }
    ).lean();

    const summary = await getSummary(tenantId, { date: businessDate });

    return {
        reconciliation: {
            businessDate: doc.businessDate,
            actualCash: doc.actualCash,
            actualBank: doc.actualBank,
            notes: doc.notes,
            locked: doc.locked,
            updatedAt: doc.updatedAt,
        },
        summary,
    };
}

export default {
    getSummary,
    saveReconciliation,
};
