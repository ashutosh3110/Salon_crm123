import mongoose from 'mongoose';
import BaseRepository from '../base.repository.js';
import Invoice from './invoice.model.js';

class InvoiceRepository extends BaseRepository {
    constructor() {
        super(Invoice);
    }

    async getDashboardStats(tenantId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await this.model.aggregate([
            { $match: { tenantId: new mongoose.Types.ObjectId(tenantId), createdAt: { $gte: today } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    invoiceCount: { $sum: 1 },
                },
            },
        ]);

        return stats[0] || { totalRevenue: 0, invoiceCount: 0 };
    }
}

export default new InvoiceRepository();
