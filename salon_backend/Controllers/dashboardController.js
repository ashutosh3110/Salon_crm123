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
            walletLiability
        ] = await Promise.all([
            Outlet.countDocuments({ salonId }),
            Booking.countDocuments({ salonId }),
            Customer.countDocuments({ salonId }), // Assuming customer is per salon
            Staff.countDocuments({ salonId }),
            WalletTransaction.aggregate([
                { $match: { salonId, type: 'credit' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).then(res => res[0]?.total || 0)
        ]);

        // Get revenue data for chart (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const revenueData = await Booking.aggregate([
            { 
                $match: { 
                    salonId, 
                    createdAt: { $gte: sevenDaysAgo },
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
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateString = date.toISOString().split('T')[0];
            const dayName = days[date.getDay()];
            
            const match = revenueData.find(d => d._id === dateString);
            chartData.push({
                name: dayName,
                revenue: match ? match.revenue : 0,
                appointments: match ? match.appointments : 0
            });
        }

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
                    walletLiability: walletLiability
                },
                revenueWeek: chartData,
                recentActivity,
                serviceDistribution: [
                    { name: 'Hair', value: 400, color: '#8B1A2D' },
                    { name: 'Face', value: 300, color: '#B4912B' },
                    { name: 'Body', value: 300, color: '#2C3E50' },
                ] // Mocking distribution for now as it requires complex service-wise aggregation
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
        
        // 1. Total Salon Stats & Counts by Status
        // Also get individual counts like active, pending etc
        const [
            totals,
            recentSalons,
            planDist,
            earnings
        ] = await Promise.all([
            Salon.aggregate([
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
            Salon.find().sort({ createdAt: -1 }).limit(5),
            Salon.aggregate([
                { $group: { _id: "$subscriptionPlan", count: { $sum: 1 } } }
            ]),
            Payment.aggregate([
                { $match: { status: 'captured' } },
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

        // 5. Growth Trends (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const [mrrTrend, salonGrowth] = await Promise.all([
            Payment.aggregate([
                { $match: { status: 'captured', createdAt: { $gte: sixMonthsAgo } } },
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
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
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
        
        // 1. Basic Stats
        const [totalSalons, activeSalons, paymentStats] = await Promise.all([
            Salon.countDocuments(),
            Salon.countDocuments({ status: 'active' }),
            Payment.aggregate([
                { $match: { status: 'captured' } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$amount" },
                        mrr: {
                            $sum: {
                                $cond: [
                                    { $gte: ["$createdAt", new Date(new Date().setMonth(new Date().getMonth() - 1))] },
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

        // 2. Growth Trends (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const [mrrTrend, salonGrowth] = await Promise.all([
            Payment.aggregate([
                { $match: { status: 'captured', createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        revenue: { $sum: "$amount" }
                    }
                },
                { $sort: { "_id": 1 } },
                { $project: { month: "$_id", revenue: 1, _id: 0 } }
            ]),
            Salon.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } },
                { $project: { month: "$_id", count: 1, _id: 0 } }
            ])
        ]);

        // 3. Plan Distribution
        const planDist = await Salon.aggregate([
            { $group: { _id: "$subscriptionPlan", value: { $sum: 1 } } },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        // 4. Geo Distribution
        const geoDist = await Salon.aggregate([
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
