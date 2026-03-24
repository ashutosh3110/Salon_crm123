import analyticsRepository from './analytics.repository.js';

const getAnalyticsStats = async () => {
    const [kpis, mrrTrend, growth, planDist, geoDist, churnTrend] = await Promise.all([
        analyticsRepository.getKPIs(),
        analyticsRepository.getMRRTrends(),
        analyticsRepository.getSalonGrowth(),
        analyticsRepository.getPlanDistribution(),
        analyticsRepository.getGeoDistribution(),
        analyticsRepository.getChurnTrends()
    ]);

    // Format months for frontend labels (e.g. "Feb 26")
    const formatMonth = (mStr) => {
        const [y, m] = mStr.split('-');
        const date = new Date(y, m - 1);
        return date.toLocaleString('default', { month: 'short', year: '2-digit' });
    };

    return {
        kpis,
        mrrTrend: mrrTrend.map(m => ({ ...m, month: formatMonth(m.month) })),
        salonGrowth: growth.map(g => ({ ...g, month: formatMonth(g.month) })),
        churnTrend: churnTrend.map(c => ({ ...c, month: formatMonth(c.month) })),
        planDist: planDist.map(p => ({
            ...p,
            color: p.name.toLowerCase() === 'free' ? '#94a3b8' : 
                   p.name.toLowerCase() === 'basic' ? '#3b82f6' : 
                   p.name.toLowerCase() === 'pro' ? '#B85C5C' : '#f59e0b'
        })),
        geoDist,
        // Mock data for missing metrics
        featureUsage: [
            { feature: 'POS', usage: 89, change: 3 },
            { feature: 'Bookings', usage: 94, change: 5 },
            { feature: 'CRM', usage: 76, change: 8 },
            { feature: 'Reports', usage: 55, change: 6 }
        ],
        churnReasons: [
            { reason: 'Too Expensive', pct: 34 },
            { reason: 'Missing Features', pct: 28 },
            { reason: 'Going Offline', pct: 17 },
            { reason: 'Competitor', pct: 13 }
        ],
        ltv: Math.round(kpis.arpu / 0.022),
        nps: 65,
        dauMau: '68%'
    };
};

export default {
    getAnalyticsStats
};
