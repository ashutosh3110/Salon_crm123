import mongoose from 'mongoose';
import Invoice from '../invoice/invoice.model.js';
import Commission from '../hr/commission.model.js';
import Booking from '../booking/booking.model.js';
import Feedback from '../feedback/feedback.model.js';
import User from '../user/user.model.js';

const DEFAULT_GOAL = 100000;
const DEFAULT_COMMISSION_PCT = 0.1;

function toOid(id) {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        return null;
    }
}

function resolvePeriod(period, startDate, endDate) {
    const now = new Date();
    let start;
    let end;
    let label = period || 'CURRENT_CYCLE';

    switch (period) {
        case 'PREVIOUS_CYCLE': {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            break;
        }
        case 'FISCAL_YTD': {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
        }
        case 'CUSTOM_RANGE': {
            if (startDate && endDate) {
                start = new Date(`${String(startDate).slice(0, 10)}T00:00:00.000Z`);
                end = new Date(`${String(endDate).slice(0, 10)}T23:59:59.999Z`);
            } else {
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                end = now;
            }
            break;
        }
        case 'CURRENT_CYCLE':
        default: {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            label = 'CURRENT_CYCLE';
            break;
        }
    }
    return { start, end, label };
}

function formatRowDate(d) {
    if (!d) return '—';
    const x = new Date(d);
    return x
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        .toUpperCase()
        .replace(/\s/g, ' ');
}

const SLABS = [
    { tier: 'Bronze', range: '₹0 – ₹50k sales', yield: '8%', status: 'REFERENCE' },
    { tier: 'Silver', range: '₹50k – ₹1L', yield: '10%', status: 'REFERENCE' },
    { tier: 'Gold', range: '₹1L – ₹2L', yield: '12%', status: 'REFERENCE' },
    { tier: 'Platinum', range: '₹2L+', yield: '15%', status: 'REFERENCE' },
];

/**
 * Credit stream: Commission rows + paid invoice lines (stylist on line) without duplicate.
 */
async function getStylistCommissionDashboard(tenantId, stylistUserId, query = {}) {
    const tid = toOid(tenantId);
    const sid = toOid(stylistUserId);
    if (!tid || !sid) {
        const err = new Error('Invalid tenant or user');
        err.statusCode = 400;
        throw err;
    }

    const { period, startDate, endDate } = query;
    const { start, end, label } = resolvePeriod(period, startDate, endDate);

    const user = await User.findOne({ _id: sid, tenantId: tid })
        .select('name salary performanceGoal')
        .lean();

    const goal =
        user?.performanceGoal != null && Number(user.performanceGoal) > 0
            ? Number(user.performanceGoal)
            : DEFAULT_GOAL;

    const [commissionRows, bookingRev, feedbackAvg] = await Promise.all([
        Commission.find({
            tenantId: tid,
            staffId: sid,
            createdAt: { $gte: start, $lte: end },
            status: { $ne: 'cancelled' },
        })
            .populate('invoiceId', 'invoiceNumber createdAt total paymentStatus')
            .populate('serviceId', 'name')
            .sort({ createdAt: -1 })
            .lean(),
        Booking.aggregate([
            {
                $match: {
                    tenantId: tid,
                    staffId: sid,
                    status: 'completed',
                    appointmentDate: { $gte: start, $lte: end },
                },
            },
            { $group: { _id: null, revenue: { $sum: '$price' } } },
        ]),
        Feedback.aggregate([
            {
                $match: {
                    tenantId: tid,
                    createdAt: { $gte: start, $lte: end },
                    staffName: new RegExp(`^${(user?.name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
                },
            },
            { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } },
        ]),
    ]);

    const bookingRevenue = Math.round(Number(bookingRev[0]?.revenue || 0) * 100) / 100;
    const progressRatio = goal > 0 ? Math.min(1, bookingRevenue / goal) : 0;
    const progressPercent = Math.round(progressRatio * 100);
    const remainingToGoal = Math.max(0, Math.round((goal - bookingRevenue) * 100) / 100);

    let fbAvg = feedbackAvg[0]?.avg;
    const fbN = feedbackAvg[0]?.n || 0;
    const repIndex =
        fbN > 0 && fbAvg != null ? Math.min(100, Math.round((Number(fbAvg) / 5) * 100)) : null;

    const coveredKeys = new Set();
    const earningsHistory = [];
    let totalCommission = 0;
    let totalBase = 0;

    for (const c of commissionRows) {
        const inv = c.invoiceId;
        const invOid = inv?._id ? String(inv._id) : String(c.invoiceId || '');
        const svcOid = c.serviceId?._id ? String(c.serviceId._id) : String(c.serviceId || '');
        coveredKeys.add(`${invOid}-${svcOid}`);

        const amt = Number(c.amount || 0);
        const base = Number(c.baseAmount || 0);
        totalCommission += amt;
        totalBase += base;
        const svcName = c.serviceId?.name || 'Service';
        const when = inv?.createdAt || c.createdAt;
        earningsHistory.push({
            id: String(c._id),
            date: formatRowDate(when),
            at: when ? new Date(when).toISOString() : new Date().toISOString(),
            services: svcName,
            revenue: Math.round(base * 100) / 100,
            commission: Math.round(amt * 100) / 100,
            status: c.status === 'paid' ? 'SETTLED' : c.status === 'pending' ? 'PENDING' : 'SETTLED',
            invoiceNumber: inv?.invoiceNumber || '',
        });
    }

    const invLines = await Invoice.aggregate([
        {
            $match: {
                tenantId: tid,
                paymentStatus: 'paid',
                createdAt: { $gte: start, $lte: end },
            },
        },
        { $unwind: '$items' },
        {
            $match: {
                'items.type': 'service',
                'items.stylistId': sid,
            },
        },
        {
            $project: {
                invoiceId: '$_id',
                createdAt: 1,
                invoiceNumber: 1,
                lineTotal: { $ifNull: ['$items.total', 0] },
                itemId: '$items.itemId',
                serviceName: { $ifNull: ['$items.name', 'Service'] },
            },
        },
    ]);

    for (const row of invLines) {
        const invOid = String(row.invoiceId);
        const itemOid = String(row.itemId || '');
        const key = `${invOid}-${itemOid}`;
        if (coveredKeys.has(key)) continue;

        const base = Number(row.lineTotal || 0);
        const amt = Math.round(base * DEFAULT_COMMISSION_PCT * 100) / 100;
        totalCommission += amt;
        totalBase += base;
        earningsHistory.push({
            id: `derived-${invOid}-${itemOid}`,
            date: formatRowDate(row.createdAt),
            at: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
            services: row.serviceName,
            revenue: Math.round(base * 100) / 100,
            commission: amt,
            status: 'ACCRUED',
            invoiceNumber: row.invoiceNumber || '',
        });
    }

    earningsHistory.sort((a, b) => new Date(b.at) - new Date(a.at));

    const opsCount = earningsHistory.length;
    const baseSalary = Math.round(Number(user?.salary || 0) * 100) / 100;

    const stats = [
        {
            key: 'totalEarned',
            label: 'Total_Earned',
            value: `₹${(Math.round(totalCommission * 100) / 100).toLocaleString('en-IN')}`,
            sub: 'Commissions in period',
        },
        {
            key: 'yieldUnits',
            label: 'Yield_Units',
            value: String(opsCount),
            sub: 'Service lines',
        },
        {
            key: 'repIndex',
            label: 'Rep_Index',
            value: repIndex != null ? `${repIndex}` : '—',
            sub: fbN > 0 ? `From ${fbN} feedback(s)` : 'No feedback in period',
        },
        {
            key: 'baseAllocation',
            label: 'Base_Allocation',
            value: `₹${baseSalary.toLocaleString('en-IN')}`,
            sub: 'Payroll base (salary)',
        },
    ];

    const nextTierAt = 150000;
    const remainingTier = Math.max(0, Math.round((nextTierAt - bookingRevenue) * 100) / 100);

    return {
        period: { label, start: start.toISOString(), end: end.toISOString() },
        stats,
        earningsHistory: earningsHistory.map(({ at, ...rest }) => rest),
        performance: {
            goal,
            bookingRevenue,
            attributedServiceSales: Math.round(totalBase * 100) / 100,
            progressPercent,
            remainingToGoal,
            remainingToNextTier: remainingTier,
            nextTierAt,
            quotaLabel: `${progressPercent}% of revenue goal`,
        },
        incentiveSlabs: SLABS,
        protocolNote:
            'POS checkout creates commission rows when a stylist is assigned. Extra lines use 10% of service total (ACCRUED) until payroll marks paid. Target progress uses completed booking revenue vs your performance goal.',
    };
}

export default {
    getStylistCommissionDashboard,
    resolvePeriod,
};
