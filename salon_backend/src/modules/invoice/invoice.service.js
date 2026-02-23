import Invoice from './invoice.model.js';

class InvoiceService {
    async queryInvoices(tenantId, filters = {}) {
        const query = { tenantId };

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

    async getDashboardStats(tenantId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const stats = await Invoice.aggregate([
            {
                $match: {
                    tenantId: { $toString: tenantId },
                    createdAt: { $gte: today, $lt: tomorrow },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    invoiceCount: { $sum: 1 },
                    avgBillValue: { $avg: '$total' },
                    cashTotal: {
                        $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$total', 0] },
                    },
                    cardTotal: {
                        $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, '$total', 0] },
                    },
                    onlineTotal: {
                        $sum: { $cond: [{ $eq: ['$paymentMethod', 'online'] }, '$total', 0] },
                    },
                },
            },
        ]);

        return stats[0] || {
            totalRevenue: 0,
            invoiceCount: 0,
            avgBillValue: 0,
            cashTotal: 0,
            cardTotal: 0,
            onlineTotal: 0,
        };
    }
}

export default new InvoiceService();
