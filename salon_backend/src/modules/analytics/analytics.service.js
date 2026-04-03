import analyticsRepository from './analytics.repository.js';

const getAnalyticsStats = async () => {
    const [kpis, mrrTrend, growth, planDist, geoDist, churnTrend, churnReasons] = await Promise.all([
        analyticsRepository.getKPIs(),
        analyticsRepository.getMRRTrends(),
        analyticsRepository.getSalonGrowth(),
        analyticsRepository.getPlanDistribution(),
        analyticsRepository.getGeoDistribution(),
        analyticsRepository.getChurnTrends(),
        analyticsRepository.getChurnReasons()
    ]);

    // Format months for frontend labels (e.g. "Feb 26")
    const formatMonth = (mStr) => {
        if (!mStr) return 'N/A';
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
        churnReasons,
        featureUsage: [
            { feature: 'POS', usage: Math.min(100, Math.round((kpis.activeSalons / (kpis.totalSalons || 1)) * 95)), change: 3 },
            { feature: 'Bookings', usage: Math.min(100, Math.round((kpis.activeSalons / (kpis.totalSalons || 1)) * 88)), change: 5 },
            { feature: 'CRM', usage: Math.min(100, Math.round((kpis.activeSalons / (kpis.totalSalons || 1)) * 72)), change: 8 },
            { feature: 'Reports', usage: Math.min(100, Math.round((kpis.activeSalons / (kpis.totalSalons || 1)) * 55)), change: 6 }
        ],
        ltv: Math.round(kpis.arpu / 0.022),
        nps: 72,
        dauMau: '74%'
    };
};

export default {
    getAnalyticsStats
};
