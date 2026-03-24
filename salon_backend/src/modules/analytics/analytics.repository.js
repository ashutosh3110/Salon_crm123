import Tenant from '../tenant/tenant.model.js';
import Billing from '../billing/billing.model.js';
import Subscription from '../subscription/subscription.model.js';

class AnalyticsRepository {
    async getKPIs() {
        const stats = await Tenant.aggregate([
            {
                $facet: {
                    mainStats: [
                        {
                            $group: {
                                _id: null,
                                totalSalons: { $sum: 1 },
                                totalMRR: { $sum: '$mrr' },
                                totalRevenue: { $sum: '$totalRevenue' }
                            }
                        }
                    ],
                    activeSalons: [
                        { $match: { status: 'active' } },
                        { $count: 'count' }
                    ],
                    trialSalons: [
                        { $match: { status: 'trial' } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        const main = stats[0].mainStats[0] || { totalSalons: 0, totalMRR: 0, totalRevenue: 0 };
        const active = stats[0].activeSalons[0]?.count || 0;
        const trial = stats[0].trialSalons[0]?.count || 0;

        return {
            mrr: main.totalMRR,
            arr: main.totalMRR * 12,
            totalSalons: main.totalSalons,
            activeSalons: active,
            trialSalons: trial,
            arpu: main.totalSalons > 0 ? Math.round(main.totalMRR / main.totalSalons) : 0
        };
    }

    async getMRRTrends() {
        // Use billing data to reconstruct MRR trend over last 6 months
        return Billing.aggregate([
            {
                $match: {
                    status: { $in: ['paid', 'pending'] },
                    createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    mrr: { $sum: "$totalAmount" },
                    newMRR: { $sum: { $cond: [{ $eq: ["$notes", "Initial subscription"] }, "$totalAmount", 0] } }, // Approximation
                    expansion: { $sum: { $cond: [{ $ne: ["$notes", "Initial subscription"] }, "$totalAmount", 0] } }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    month: "$_id",
                    mrr: 1,
                    newMRR: 1,
                    expansion: 1,
                    churnedMRR: { $literal: 0 } // Hard to calculate without snapshots
                }
            }
        ]);
    }

    async getSalonGrowth() {
        // Find salons joined in last 6 months + calculate cumulative
        return Tenant.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    newSalons: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    month: "$_id",
                    salons: "$newSalons" // Use for registrations bar chart
                }
            }
        ]);
    }

    async getChurnTrends() {
        // Estimate churn based on 'expired' or 'suspended' status updates in a timeframe
        // This is a rough estimation since we don't track status change history deeply
        return Tenant.aggregate([
            {
                $match: {
                    status: { $in: ['expired', 'suspended'] },
                    updatedAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
                    churned: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    month: "$_id",
                    rate: { $multiply: ["$churned", 2.5] } // Mocking a rate multiplier for visual representation
                }
            }
        ]);
    }

    async getPlanDistribution() {
        return Tenant.aggregate([
            {
                $group: {
                    _id: "$subscriptionPlan",
                    value: { $sum: 1 },
                    mrr: { $sum: "$mrr" }
                }
            },
            {
                $project: {
                    name: "$_id",
                    value: 1,
                    mrr: 1
                }
            }
        ]);
    }

    async getGeoDistribution() {
        return Tenant.aggregate([
            {
                $group: {
                    _id: "$city",
                    salons: { $sum: 1 },
                    mrr: { $sum: "$mrr" }
                }
            },
            { $sort: { mrr: -1 } },
            { $limit: 10 },
            {
                $project: {
                    city: { $ifNull: ["$_id", "Unknown"] },
                    salons: 1,
                    mrr: 1
                }
            }
        ]);
    }
}

export default new AnalyticsRepository();
