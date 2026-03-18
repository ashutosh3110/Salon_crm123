import BaseRepository from '../base.repository.js';
import Billing from './billing.model.js';

class BillingRepository extends BaseRepository {
    constructor() {
        super(Billing);
    }

    async getStats() {
        const stats = await this.model.aggregate([
            {
                $facet: {
                    totalRevenue: [
                        { $match: { status: { $in: ['paid', 'pending'] } } },
                        { $group: { 
                            _id: null, 
                            total: { $sum: '$totalAmount' },
                            subtotal: { $sum: '$amount' },
                            tax: { $sum: '$taxAmount' }
                        } }
                    ],
                    failedCount: [
                        { $match: { status: 'failed' } },
                        { $count: 'count' }
                    ],
                    refundedAmount: [
                        { $match: { status: 'refunded' } },
                        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                    ],
                    monthlyRevenue: [
                        { $match: { status: { $in: ['paid', 'pending'] } } },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                                revenue: { $sum: "$totalAmount" },
                                subtotal: { $sum: "$amount" },
                                tax: { $sum: "$taxAmount" }
                            }
                        },
                        { $sort: { "_id": 1 } },
                        { $limit: 6 }
                    ],
                    planDistribution: [
                        { $match: { status: { $in: ['paid', 'pending'] } } },
                        {
                            $group: {
                                _id: "$planName",
                                count: { $sum: 1 },
                                revenue: { $sum: "$totalAmount" }
                            }
                        }
                    ]
                }
            }
        ]);

        return stats[0];
    }
}

export default new BillingRepository();
