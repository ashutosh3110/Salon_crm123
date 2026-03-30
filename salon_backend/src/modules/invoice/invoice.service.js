import mongoose from 'mongoose';
import Invoice from './invoice.model.js';
import Transaction from '../finance/transaction.model.js';
import InventoryTransaction from '../inventory/inventoryTransaction.model.js';

function toTenantObjectId(tenantId) {
    if (!tenantId) return null;
    if (tenantId instanceof mongoose.Types.ObjectId) return tenantId;
    try {
        const tid = String(tenantId).trim();
        return mongoose.Types.ObjectId.isValid(tid) ? new mongoose.Types.ObjectId(tid) : null;
    } catch {
        return null;
    }
}

class InvoiceService {
    async queryInvoices(tenantId, filters = {}) {
        const tid = toTenantObjectId(tenantId);
        if (!tid) return { results: [], page: 1, limit: 50, totalPages: 0, totalResults: 0 };
        const query = { tenantId: tid };

        // Date filter
        if (filters.date === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            query.createdAt = { $gte: today, $lt: tomorrow };
        } else if (filters.startDate && filters.endDate) {
            query.createdAt = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate),
            };
        }

        // Outlet filter
        if (filters.outletId) {
            query.outletId = filters.outletId;
        }

        // Payment method filter
        if (filters.paymentMethod) {
            query.paymentMethod = filters.paymentMethod;
        }

        // Payment status filter
        if (filters.paymentStatus) {
            query.paymentStatus = filters.paymentStatus;
        }

        // Search filter
        if (filters.search) {
            const searchRegex = new RegExp(filters.search, 'i');
            // Note: Since clientId is a ref, we'll need to handle this carefully.
            // For simplicity in this step, we'll search by invoiceNumber if it exists.
            // A more robust way would be to aggregate or search clientIds first.
            query.$or = [
                { invoiceNumber: searchRegex },
                { paymentStatus: searchRegex }
            ];
        }

        let invoiceQuery = Invoice.find(query)
            .populate('clientId', 'name phone email')
            .populate('outletId', 'name')
            .populate('staffId', 'name')
            .sort({ createdAt: -1 });

        // Pagination
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 50;
        const skip = (page - 1) * limit;
        invoiceQuery = invoiceQuery.skip(skip).limit(limit);

        const [invoices, total] = await Promise.all([
            invoiceQuery.exec(),
            Invoice.countDocuments(query),
        ]);

        return {
            results: invoices,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
        };
    }

    async getInvoiceById(tenantId, invoiceId) {
        const invoice = await Invoice.findOne({ _id: invoiceId, tenantId })
            .populate('clientId', 'name phone email loyaltyPoints')
            .populate('outletId', 'name address phone')
            .populate('staffId', 'name email')
            .populate('promotionId', 'name discountType discountValue');

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        return invoice;
    }

    async settleInvoice(tenantId, invoiceId, paymentData) {
        const tid = toTenantObjectId(tenantId);
        const invoice = await Invoice.findOne({ _id: invoiceId, tenantId: tid });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        if (invoice.paymentStatus === 'paid') {
            throw new Error('Invoice is already settled');
        }

        invoice.paymentStatus = 'paid';
        invoice.paymentMethod = paymentData.paymentMethod || 'cash';
        
        await invoice.save();
        return invoice;
    }

    async getDashboardStats(tenantId) {
        const tid = toTenantObjectId(tenantId);
        if (!tid) return this._emptyStats();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [invoiceStats, expenseStats] = await Promise.all([
            Invoice.aggregate([
                { $match: { tenantId: tid, createdAt: { $gte: today, $lt: tomorrow }, paymentStatus: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$total' },
                        invoiceCount: { $sum: 1 },
                        avgBillValue: { $avg: '$total' },
                        cashTotal: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$total', 0] } },
                        cardTotal: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, '$total', 0] } },
                        onlineTotal: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'online'] }, '$total', 0] } },
                    },
                },
            ]),
            Transaction.aggregate([
                { $match: { tenantId: tid, type: 'expense', createdAt: { $gte: today, $lt: tomorrow } } },
                { $group: { _id: null, totalExpenses: { $sum: '$amount' } } },
            ]),
        ]);

        const i = invoiceStats[0] || {};
        const e = expenseStats[0] || {};

        return {
            totalRevenue: i.totalRevenue || 0,
            totalExpenses: e.totalExpenses || 0,
            invoiceCount: i.invoiceCount || 0,
            avgBillValue: i.avgBillValue || 0,
            cashTotal: i.cashTotal || 0,
            cardTotal: i.cardTotal || 0,
            onlineTotal: i.onlineTotal || 0,
            netProfit: (i.totalRevenue || 0) - (e.totalExpenses || 0),
        };
    }

    _emptyStats() {
        return {
            totalRevenue: 0,
            totalExpenses: 0,
            invoiceCount: 0,
            avgBillValue: 0,
            cashTotal: 0,
            cardTotal: 0,
            onlineTotal: 0,
            netProfit: 0,
        };
    }

    async queryRefunds(tenantId, filters = {}) {
        const query = {
            tenantId,
            'refund.requested': true,
        };

        if (filters.status && ['pending', 'approved', 'rejected'].includes(String(filters.status).toLowerCase())) {
            query['refund.status'] = String(filters.status).toLowerCase();
        }

        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 50;
        const skip = (page - 1) * limit;

        const [invoices, total] = await Promise.all([
            Invoice.find(query)
                .populate('clientId', 'name phone email')
                .sort({ 'refund.requestedAt': -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            Invoice.countDocuments(query),
        ]);

        return {
            results: invoices,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
        };
    }

    async processRefundAction(tenantId, invoiceId, payload = {}) {
        const status = String(payload.status || '').toLowerCase();
        if (!['approved', 'rejected'].includes(status)) {
            throw new Error('Invalid refund status');
        }

        const invoice = await Invoice.findOne({ _id: invoiceId, tenantId });
        if (!invoice) {
            throw new Error('Invoice not found');
        }
        if (!invoice.refund?.requested) {
            throw new Error('No refund request found for this invoice');
        }
        if (invoice.refund?.status !== 'pending') {
            throw new Error('Refund is already processed');
        }

        invoice.refund.status = status;
        invoice.refund.remark = String(payload.remark || '');
        invoice.refund.processedAt = new Date();
        await invoice.save();

        return invoice;
    }

    /**
     * Admin Finance dashboard: revenue (invoices), expenses (finance transactions), trends, recent lines.
     */
    async getFinanceDashboard(tenantId) {
        const tid = toTenantObjectId(tenantId);

        const start12 = new Date();
        start12.setMonth(start12.getMonth() - 11);
        start12.setDate(1);
        start12.setHours(0, 0, 0, 0);

        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const [
            revenueByMonth,
            expenseByMonth,
            revenueMtd,
            expenseMtd,
            pendingRefunds,
            expenseByCategory,
            supplierStockInMtd,
        ] = await Promise.all([
            Invoice.aggregate([
                {
                    $match: {
                        tenantId: tid,
                        paymentStatus: { $nin: ['cancelled'] },
                        createdAt: { $gte: start12 },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' },
                        },
                        revenue: { $sum: '$total' },
                    },
                },
            ]),
            Transaction.aggregate([
                {
                    $match: {
                        tenantId: tid,
                        type: 'expense',
                        createdAt: { $gte: start12 },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m', date: '$createdAt' },
                        },
                        expense: { $sum: '$amount' },
                    },
                },
            ]),
            Invoice.aggregate([
                {
                    $match: {
                        tenantId: tid,
                        paymentStatus: { $nin: ['cancelled'] },
                        createdAt: { $gte: monthStart },
                    },
                },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Transaction.aggregate([
                {
                    $match: {
                        tenantId: tid,
                        type: 'expense',
                        createdAt: { $gte: monthStart },
                    },
                },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            Invoice.countDocuments({
                tenantId: tid,
                'refund.requested': true,
                'refund.status': 'pending',
            }),
            Transaction.aggregate([
                {
                    $match: {
                        tenantId: tid,
                        type: 'expense',
                        createdAt: { $gte: ninetyDaysAgo },
                    },
                },
                {
                    $group: {
                        _id: '$category',
                        total: { $sum: '$amount' },
                    },
                },
            ]),
            InventoryTransaction.aggregate([
                {
                    $match: {
                        tenantId: tid,
                        type: 'STOCK_IN',
                        createdAt: { $gte: monthStart },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $multiply: ['$quantity', { $ifNull: ['$purchasePrice', 0] }],
                            },
                        },
                    },
                },
            ]),
        ]);

        const revMap = Object.fromEntries(revenueByMonth.map((r) => [r._id, r.revenue]));
        const expMap = Object.fromEntries(expenseByMonth.map((r) => [r._id, r.expense]));

        const monthlyTrend = [];
        for (let i = 11; i >= 0; i -= 1) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            d.setDate(1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const name = d.toLocaleString('en-IN', { month: 'short' });
            monthlyTrend.push({
                name,
                revenue: Math.round((revMap[key] || 0) * 100) / 100,
                expense: Math.round((expMap[key] || 0) * 100) / 100,
            });
        }

        const grossInflow = revenueMtd[0]?.total || 0;
        const totalExpenses = expenseMtd[0]?.total || 0;
        const supplierPurchasesMtd = Math.round((supplierStockInMtd[0]?.total || 0) * 100) / 100;
        const netLiquidity = grossInflow - totalExpenses;

        const catTotal = expenseByCategory.reduce((s, c) => s + (c.total || 0), 0);
        const costAllocation = expenseByCategory.map((c) => ({
            label: String(c._id || 'other').replace(/_/g, ' '),
            percentage: catTotal ? Math.round(((c.total || 0) / catTotal) * 100) : 0,
            amount: c.total || 0,
        }));

        const [recentInvoices, recentExpenseTx] = await Promise.all([
            Invoice.find({
                tenantId: tid,
                paymentStatus: { $nin: ['cancelled'] },
            })
                .sort({ createdAt: -1 })
                .limit(6)
                .populate('staffId', 'name')
                .lean(),
            Transaction.find({ tenantId: tid, type: 'expense' })
                .sort({ createdAt: -1 })
                .limit(6)
                .lean(),
        ]);

        const recentLines = [
            ...recentInvoices.map((inv) => ({
                id: `inv-${inv._id}`,
                kind: 'invoice',
                label: `Invoice ${inv.invoiceNumber || ''}`.trim(),
                amount: inv.total,
                type: 'income',
                staff: inv.staffId?.name || '—',
                at: inv.createdAt,
            })),
            ...recentExpenseTx.map((tx) => ({
                id: `tx-${tx._id}`,
                kind: 'expense_tx',
                label: tx.description || tx.category || 'Expense',
                amount: tx.amount,
                type: 'expense',
                staff: '—',
                at: tx.createdAt || tx.date,
            })),
        ]
            .sort((a, b) => new Date(b.at) - new Date(a.at))
            .slice(0, 8);

        return {
            monthlyTrend,
            kpis: {
                grossInflow,
                totalExpenses,
                supplierPurchasesMtd,
                netLiquidity,
                pendingRefunds,
                liabilityHint: pendingRefunds > 0 ? `${pendingRefunds} refund(s) pending` : 'None pending',
            },
            costAllocation,
            recentTransactions: recentLines,
            cashPosition: {
                openingCash: null,
                bankBalance: null,
                note: 'Connect cash/bank ledgers to show balances',
            },
        };
    }
}

export default new InvoiceService();
