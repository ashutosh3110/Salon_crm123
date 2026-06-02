const Outlet = require('../Models/Outlet');
const Booking = require('../Models/Booking');
const Customer = require('../Models/Customer');
const Staff = require('../Models/Staff');
const Salon = require('../Models/Salon');
const WalletTransaction = require('../Models/WalletTransaction');

// @desc    Get salon dashboard stats
// @route   GET /api/dashboard/salon
// @access  Private/Admin
exports.getSalonDashboard = async (req, res) => {
    try {
        const salonId = req.user.salonId;

        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Salon ID not found in user context' });
        }

        // Parallel counts for efficiency
        const [
            outletsCount,
            bookingsCount,
            customersCount,
            staffCount,
            walletLiability,
            salonDoc
        ] = await Promise.all([
            Outlet.countDocuments({ salonId }),
            Booking.countDocuments({ salonId }),
            Customer.countDocuments({ salonId }), // Assuming customer is per salon
            Staff.countDocuments({ salonId }),
            WalletTransaction.aggregate([
                { $match: { salonId, type: 'CREDIT' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).then(res => res[0]?.total || 0),
            Salon.findById(salonId).select('whatsappSettings')
        ]);

        const whatsappCredits = salonDoc?.whatsappSettings?.whatsappCredits ?? 0;

        // Get dynamic range
        const range = req.query.range || 'week';
        const daysToFetch = range === 'month' ? 30 : 7;

        // Get revenue data for chart
        let rangeAgo = new Date();
        if (range === 'week') {
            const today = new Date();
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            rangeAgo = new Date(today.setDate(diff));
            rangeAgo.setHours(0, 0, 0, 0);
        } else {
            rangeAgo.setDate(rangeAgo.getDate() - daysToFetch);
        }

        const revenueData = await Booking.aggregate([
            { 
                $match: { 
                    salonId, 
                    createdAt: { $gte: rangeAgo },
                    status: 'completed'
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" },
                    appointments: { $count: {} }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Format revenue data for recharts
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartData = [];
        for (let i = 0; i < daysToFetch; i++) {
            const date = new Date(rangeAgo);
            date.setDate(rangeAgo.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            
            let label = '';
            if (range === 'month') {
                label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            } else {
                label = days[date.getDay()];
            }
            
            const match = revenueData.find(d => d._id === dateString);
            chartData.push({
                name: label,
                revenue: match ? match.revenue : 0,
                appointments: match ? match.appointments : 0
            });
        }

        // Calculate comparison stats for bottom cards (This Week, Last Week, This Month, Last Month)
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const completedBookings = await Booking.find({
            salonId,
            status: 'completed',
            createdAt: { $gte: sixtyDaysAgo }
        }).select('totalPrice createdAt');

        const now = new Date();
        const startOfThisWeek = new Date();
        startOfThisWeek.setDate(now.getDate() - 7);

        const startOfLastWeek = new Date();
        startOfLastWeek.setDate(now.getDate() - 14);

        const startOfThisMonth = new Date();
        startOfThisMonth.setDate(now.getDate() - 30);

        const startOfLastMonth = new Date();
        startOfLastMonth.setDate(now.getDate() - 60);

        let thisWeekRev = 0;
        let lastWeekRev = 0;
        let thisMonthRev = 0;
        let lastMonthRev = 0;

        completedBookings.forEach(booking => {
            const date = new Date(booking.createdAt);
            const amt = booking.totalPrice || 0;

            if (date >= startOfThisWeek) {
                thisWeekRev += amt;
            } else if (date >= startOfLastWeek) {
                lastWeekRev += amt;
            }

            if (date >= startOfThisMonth) {
                thisMonthRev += amt;
            } else if (date >= startOfLastMonth) {
                lastMonthRev += amt;
            }
        });

        // Get recent activity (last 5 bookings)
        const recentBookings = await Booking.find({ salonId })
            .populate('clientId', 'name')
            .populate('serviceId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentActivity = recentBookings.map(b => ({
            client: b.clientId?.name || 'Guest',
            service: b.serviceId?.name || 'N/A',
            amount: `₹${b.totalPrice || 0}`,
            time: new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: b.createdAt,
            isLive: b.status === 'confirmed' || b.status === 'pending'
        }));

        res.json({
            success: true,
            data: {
                stats: {
                    outlets: outletsCount,
                    bookingsTotal: bookingsCount,
                    clients: customersCount,
                    staff: staffCount,
                    walletLiability: walletLiability,
                    whatsappCredits: whatsappCredits,
                    thisWeekRev,
                    lastWeekRev,
                    thisMonthRev,
                    lastMonthRev
                },
                revenueWeek: chartData,
                recentActivity,
                serviceDistribution: await (async () => {
                    const COLORS = ['#8B1A2D', '#B4912B', '#2C3E50', '#3b82f6', '#10b981', '#f59e0b'];
                    const Service = require('../Models/Service');
                    const dist = await Booking.aggregate([
                        { $match: { salonId, status: 'completed' } },
                        { $group: { _id: '$serviceId', count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 6 },
                        { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'svc' } },
                        { $project: { name: { $ifNull: [{ $arrayElemAt: ['$svc.name', 0] }, 'Unknown'] }, value: '$count' } }
                    ]);
                    return dist.map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }));
                })()
            }
        });

    } catch (err) {
        console.error('Dashboard Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get superadmin dashboard stats
// @route   GET /api/dashboard/superadmin
// @access  Private/SuperAdmin
exports.getSuperAdminDashboard = async (req, res) => {
    try {
        const Payment = require('../Models/Payment');
        const { startDate, endDate, plan, city } = req.query;

        // Build salon match criteria
        let salonMatch = {};
        if (plan) {
            salonMatch.subscriptionPlan = plan;
        }
        if (city) {
            salonMatch['address.city'] = new RegExp(city, 'i');
        }

        // Build date filter
        let dateQuery = {};
        let hasDateFilter = false;
        if (startDate || endDate) {
            hasDateFilter = true;
            if (startDate) dateQuery.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateQuery.$lte = end;
            }
            salonMatch.createdAt = dateQuery;
        }

        // Build payment match criteria
        let paymentMatch = { status: 'captured' };
        if (hasDateFilter) {
            paymentMatch.createdAt = dateQuery;
        }

        // 1. Total Salon Stats & Counts by Status
        // Also get individual counts like active, pending etc
        const [
            totals,
            recentSalons,
            planDist,
            earnings
        ] = await Promise.all([
            Salon.aggregate([
                { $match: salonMatch },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
                        trial: { $sum: { $cond: [{ $eq: ["$status", "trial"] }, 1, 0] } },
                        expired: { $sum: { $cond: [{ $eq: ["$status", "expired"] }, 1, 0] } },
                        suspended: { $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] } },
                        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } }
                    }
                }
            ]),
            Salon.find(salonMatch).populate('outlets').sort({ createdAt: -1 }).limit(5),
            Salon.aggregate([
                { $match: salonMatch },
                { $group: { _id: "$subscriptionPlan", count: { $sum: 1 } } }
            ]),
            Payment.aggregate([
                { $match: paymentMatch },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$amount" },
                        revenueToday: {
                            $sum: {
                                $cond: [
                                    { $gte: ["$createdAt", new Date(new Date().setHours(0, 0, 0, 0))] },
                                    "$amount",
                                    0
                                ]
                            }
                        }
                    }
                }
            ])
        ]);

        const stats = totals[0] || { total: 0, active: 0, trial: 0, expired: 0, suspended: 0, pending: 0 };
        const revenue = earnings[0] || { totalRevenue: 0, revenueToday: 0 };

        // 5. Growth Trends
        let growthPaymentMatch = { status: 'captured' };
        let growthSalonMatch = { ...salonMatch };

        if (hasDateFilter) {
            growthPaymentMatch.createdAt = dateQuery;
            // growthSalonMatch.createdAt is already set inside salonMatch
        } else {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            growthPaymentMatch.createdAt = { $gte: sixMonthsAgo };
            growthSalonMatch.createdAt = { $gte: sixMonthsAgo };
        }

        const [mrrTrend, salonGrowth] = await Promise.all([
            Payment.aggregate([
                { $match: growthPaymentMatch },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        mrr: { $sum: "$amount" }
                    }
                },
                { $sort: { "_id": 1 } },
                { $project: { month: "$_id", mrr: 1, _id: 0 } }
            ]),
            Salon.aggregate([
                { $match: growthSalonMatch },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        salons: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } },
                { $project: { month: "$_id", salons: 1, _id: 0 } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                counts: {
                    total: stats.total,
                    active: stats.active,
                    trial: stats.trial,
                    expired: stats.expired,
                    suspended: stats.suspended,
                    pending: stats.pending
                },
                recentSalons,
                planDistribution: planDist,
                revenue: {
                    total: revenue.totalRevenue,
                    today: revenue.revenueToday
                },
                mrrTrend,
                salonGrowth
            }
        });

    } catch (err) {
        console.error('SuperAdmin Dashboard Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get detailed superadmin analytics
// @route   GET /api/dashboard/superadmin/analytics
// @access  Private/SuperAdmin
exports.getSuperAdminAnalytics = async (req, res) => {
    try {
        const Payment = require('../Models/Payment');
        const Salon = require('../Models/Salon');
        
        const { startDate, endDate } = req.query;
        let dateQuery = {};
        const hasDateFilter = !!(startDate || endDate);

        if (startDate) dateQuery.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateQuery.$lte = end;
        }

        // Total / Active Salons Query
        let totalSalonsQuery = {};
        let activeSalonsQuery = { status: 'active' };
        if (hasDateFilter) {
            totalSalonsQuery.createdAt = dateQuery;
            activeSalonsQuery.createdAt = dateQuery;
        }

        // Payment stats query
        let paymentStatsMatch = { status: 'captured' };
        if (hasDateFilter) {
            paymentStatsMatch.createdAt = dateQuery;
        }

        // Monthly Recurring Revenue helper (last 30 days of the range or current date)
        let mrrDateThreshold;
        if (endDate) {
            const end = new Date(endDate);
            end.setMonth(end.getMonth() - 1);
            mrrDateThreshold = end;
        } else {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            mrrDateThreshold = oneMonthAgo;
        }

        // 1. Basic Stats
        const [totalSalons, activeSalons, paymentStats] = await Promise.all([
            Salon.countDocuments(totalSalonsQuery),
            Salon.countDocuments(activeSalonsQuery),
            Payment.aggregate([
                { $match: paymentStatsMatch },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$amount" },
                        mrr: {
                            $sum: {
                                $cond: [
                                    { $gte: ["$createdAt", mrrDateThreshold] },
                                    "$amount",
                                    0
                                ]
                            }
                        }
                    }
                }
            ])
        ]);

        const rev = paymentStats[0] || { totalRevenue: 0, mrr: 0 };

        // 2. Growth Trends Range Matcher
        let growthPaymentMatch = { status: 'captured' };
        let growthSalonMatch = {};

        if (hasDateFilter) {
            growthPaymentMatch.createdAt = dateQuery;
            growthSalonMatch.createdAt = dateQuery;
        } else {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            growthPaymentMatch.createdAt = { $gte: sixMonthsAgo };
            growthSalonMatch.createdAt = { $gte: sixMonthsAgo };
        }

        // Dynamic Grouping Format: Month format (%Y-%m) or Day format (%Y-%m-%d) for shorter ranges
        let isShortRange = false;
        if (startDate && endDate) {
            const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 31) {
                isShortRange = true;
            }
        }

        const dateFormat = isShortRange ? "%Y-%m-%d" : "%Y-%m";

        const [mrrTrend, salonGrowth] = await Promise.all([
            Payment.aggregate([
                { $match: growthPaymentMatch },
                {
                    $group: {
                        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                        revenue: { $sum: "$amount" }
                    }
                },
                { $sort: { "_id": 1 } },
                { $project: { month: "$_id", revenue: 1, _id: 0 } }
            ]),
            Salon.aggregate([
                { $match: growthSalonMatch },
                {
                    $group: {
                        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } },
                { $project: { month: "$_id", count: 1, _id: 0 } }
            ])
        ]);

        // 3. Plan Distribution
        let planDistMatch = {};
        if (hasDateFilter) {
            planDistMatch.createdAt = dateQuery;
        }
        const planDist = await Salon.aggregate([
            { $match: planDistMatch },
            { $group: { _id: "$subscriptionPlan", value: { $sum: 1 } } },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        // 4. Geo Distribution
        let geoDistMatch = {};
        if (hasDateFilter) {
            geoDistMatch.createdAt = dateQuery;
        }
        const geoDist = await Salon.aggregate([
            { $match: geoDistMatch },
            { $group: { _id: "$address.city", salons: { $sum: 1 } } },
            { $sort: { salons: -1 } },
            { $limit: 10 },
            { $project: { city: { $ifNull: ["$_id", "Unknown"] }, salons: 1, _id: 0 } }
        ]);

        res.json({
            success: true,
            data: {
                kpis: {
                    totalSalons,
                    activeSalons,
                    mrr: rev.mrr,
                    arr: rev.mrr * 12,
                    totalRevenue: rev.totalRevenue
                },
                growth: {
                    mrrTrend,
                    salonTrend: salonGrowth
                },
                planDistribution: planDist,
                geoDistribution: geoDist
            }
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
