import mongoose from 'mongoose';
import Invoice from '../invoice/invoice.model.js';
import Booking from '../booking/booking.model.js';
import Client from '../client/client.model.js';
import User from '../user/user.model.js';
import Outlet from '../outlet/outlet.model.js';
import LoyaltyWallet from '../loyalty/loyaltyWallet.model.js';
import Attendance from '../attendance/attendance.model.js';
import Feedback from '../feedback/feedback.model.js';
import hrPerformanceService from '../hrPerformance/hrPerformance.service.js';
import LeaveRequest from '../stylist/leaveRequest.model.js';

function toTenantObjectId(tenantId) {
    if (!tenantId) return tenantId;
    if (tenantId instanceof mongoose.Types.ObjectId) return tenantId;
    try {
        return new mongoose.Types.ObjectId(String(tenantId));
    } catch {
        return tenantId;
    }
}

const PIE_COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#14b8a6'];

/**
 * Admin home (/admin): KPIs, 7-day revenue vs bookings, service mix, recent invoices + bookings.
 */
async function getSalonDashboard(tenantId) {
    const tid = toTenantObjectId(tenantId);

    const now = new Date();
    const endDay = new Date(now);
    endDay.setHours(23, 59, 59, 999);
    const startWeek = new Date(now);
    startWeek.setDate(startWeek.getDate() - 6);
    startWeek.setHours(0, 0, 0, 0);

    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setHours(0, 0, 0, 0);

    const [
        outlets,
        clients,
        staff,
        bookingsTotal,
        walletAgg,
        revenueByDay,
        bookingsByDay,
        serviceMix,
        recentInvoices,
        recentBookings,
    ] = await Promise.all([
        Outlet.countDocuments({ tenantId: tid }),
        Client.countDocuments({ tenantId: tid }),
        User.countDocuments({ tenantId: tid, role: { $ne: 'superadmin' } }),
        Booking.countDocuments({ tenantId: tid, status: { $ne: 'cancelled' } }),
        LoyaltyWallet.aggregate([
            { $match: { tenantId: tid } },
            { $group: { _id: null, total: { $sum: '$totalPoints' } } },
        ]),
        Invoice.aggregate([
            {
                $match: {
                    tenantId: tid,
                    paymentStatus: 'paid',
                    createdAt: { $gte: startWeek, $lte: endDay },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                },
            },
        ]),
        Booking.aggregate([
            {
                $match: {
                    tenantId: tid,
                    status: { $ne: 'cancelled' },
                    appointmentDate: { $gte: startWeek, $lte: endDay },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } },
                    count: { $sum: 1 },
                },
            },
        ]),
        Invoice.aggregate([
            {
                $match: {
                    tenantId: tid,
                    paymentStatus: 'paid',
                    createdAt: { $gte: ninetyDaysAgo },
                },
            },
            { $unwind: '$items' },
            { $match: { 'items.type': 'service' } },
            {
                $group: {
                    _id: { $ifNull: ['$items.name', 'Service'] },
                    value: { $sum: { $ifNull: ['$items.quantity', 1] } },
                },
            },
            { $sort: { value: -1 } },
            { $limit: 6 },
        ]),
        Invoice.find({ tenantId: tid, paymentStatus: 'paid' })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate('clientId', 'name')
            .select('createdAt total invoiceNumber items clientId')
            .lean(),
        Booking.find({ tenantId: tid, status: { $ne: 'cancelled' } })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate('clientId', 'name')
            .populate('serviceId', 'name')
            .select('createdAt appointmentDate price status clientId serviceId')
            .lean(),
    ]);

    const revMap = Object.fromEntries(revenueByDay.map((r) => [r._id, r.revenue]));
    const bookMap = Object.fromEntries(bookingsByDay.map((r) => [r._id, r.count]));

    const revenueWeek = [];
    for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(12, 0, 0, 0);
        const key = d.toISOString().slice(0, 10);
        const name = d.toLocaleDateString('en-US', { weekday: 'short' });
        revenueWeek.push({
            name,
            revenue: Math.round((revMap[key] || 0) * 100) / 100,
            appointments: bookMap[key] || 0,
        });
    }

    const serviceDistribution = (serviceMix || []).map((row, i) => ({
        name: row._id || 'Service',
        value: Math.round(Number(row.value || 0) * 100) / 100,
        color: PIE_COLORS[i % PIE_COLORS.length],
    }));

    const walletLiability = Math.round(Number(walletAgg[0]?.total || 0) * 100) / 100;

    const activity = [];

    for (const inv of recentInvoices) {
        const clientName = inv.clientId?.name || 'Client';
        const svc =
            (inv.items || []).find((it) => it.type === 'service' && it.name)?.name || 'Sale';
        activity.push({
            kind: 'invoice',
            client: clientName,
            service: svc,
            time: inv.createdAt ? new Date(inv.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
            amount: `₹${Number(inv.total || 0).toLocaleString('en-IN')}`,
            status: 'Completed',
            isLive: false,
            at: inv.createdAt,
        });
    }

    for (const b of recentBookings) {
        const clientName = b.clientId?.name || 'Client';
        const svc = b.serviceId?.name || 'Appointment';
        const when = b.appointmentDate || b.createdAt;
        activity.push({
            kind: 'booking',
            client: clientName,
            service: svc,
            time: when ? new Date(when).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
            amount: `₹${Number(b.price || 0).toLocaleString('en-IN')}`,
            status: b.status === 'completed' ? 'Completed' : b.status === 'confirmed' ? 'Confirmed' : 'Pending',
            isLive: ['pending', 'confirmed'].includes(b.status),
            at: b.createdAt || b.appointmentDate,
        });
    }

    activity.sort((a, b) => new Date(b.at) - new Date(a.at));
    const recentActivity = activity.slice(0, 8);

    return {
        stats: {
            outlets,
            bookingsTotal,
            clients,
            staff,
            walletLiability,
        },
        revenueWeek,
        serviceDistribution,
        recentActivity,
        generatedAt: new Date().toISOString(),
    };
}

function ymdLocal(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Last 7 days paid invoice totals per day (tenant-wide), aligned with admin salon revenue week logic.
 */
async function getTeamRevenueGrowthLast7Days(tenantId) {
    const tid = toTenantObjectId(tenantId);
    const now = new Date();
    const endDay = new Date(now);
    endDay.setHours(23, 59, 59, 999);
    const startWeek = new Date(now);
    startWeek.setDate(startWeek.getDate() - 6);
    startWeek.setHours(0, 0, 0, 0);

    const revenueByDay = await Invoice.aggregate([
        {
            $match: {
                tenantId: tid,
                paymentStatus: 'paid',
                createdAt: { $gte: startWeek, $lte: endDay },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$total' },
            },
        },
    ]);
    const revMap = Object.fromEntries(revenueByDay.map((r) => [r._id, r.revenue]));

    const points = [];
    for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(12, 0, 0, 0);
        const key = d.toISOString().slice(0, 10);
        const day = d.toLocaleDateString('en-US', { weekday: 'short' });
        points.push({
            day,
            dateYmd: key,
            revenue: Math.round((Number(revMap[key]) || 0) * 100) / 100,
        });
    }
    return points;
}

function formatRoleLabel(role) {
    const r = String(role || '').toLowerCase();
    if (r === 'stylist') return 'Stylist';
    if (r === 'receptionist') return 'Receptionist';
    if (r === 'manager') return 'Manager';
    if (r === 'admin') return 'Admin';
    if (r === 'accountant') return 'Accountant';
    if (r === 'inventory_manager') return 'Inventory';
    return role ? String(role).replace(/_/g, ' ') : 'Staff';
}

function displayRoleFromUser(u) {
    const sp = (u.specialist && String(u.specialist).trim()) ? String(u.specialist).trim() : '';
    if (sp) return sp;
    return formatRoleLabel(u.role);
}

function formatJoined(d) {
    if (!d) return '—';
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return '—';
    return x.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

/**
 * Manager team registry: staff list + KPIs (bookings completed, feedback rating, leave overlap).
 */
async function getManagerTeam(tenantId) {
    const tid = toTenantObjectId(tenantId);
    const todayYmd = ymdLocal(new Date());

    const users = await User.find({ tenantId: tid, role: { $ne: 'superadmin' } })
        .select('name email phone role status specialist joinedDate createdAt')
        .populate('outletId', 'name')
        .sort({ name: 1 })
        .lean();

    const userIds = users.map((u) => u._id);

    const [bookingAgg, feedbackNameAgg, onLeaveCount, revenueGrowth] = await Promise.all([
        userIds.length
            ? Booking.aggregate([
                  {
                      $match: {
                          tenantId: tid,
                          staffId: { $in: userIds },
                          status: 'completed',
                      },
                  },
                  {
                      $group: {
                          _id: '$staffId',
                          count: { $sum: 1 },
                      },
                  },
              ])
            : Promise.resolve([]),
        Feedback.aggregate([
            {
                $match: {
                    tenantId: tid,
                    staffName: { $nin: ['', null] },
                },
            },
            {
                $group: {
                    _id: { $toLower: { $trim: { input: '$staffName' } } },
                    avg: { $avg: '$rating' },
                },
            },
        ]),
        LeaveRequest.countDocuments({
            tenantId: tid,
            status: 'APPROVED',
            startDate: { $lte: todayYmd },
            endDate: { $gte: todayYmd },
        }),
    ]);

    const countMap = new Map(bookingAgg.map((x) => [x._id.toString(), x.count]));
    const ratingByName = new Map(feedbackNameAgg.map((x) => [x._id, x.avg]));

    const members = users.map((u) => {
        const id = u._id.toString();
        const nameKey = (u.name || '').trim().toLowerCase();
        const avgR = nameKey ? ratingByName.get(nameKey) : null;
        const rating =
            avgR != null && !Number.isNaN(Number(avgR)) ? Math.round(Number(avgR) * 10) / 10 : null;
        return {
            id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            role: u.role,
            displayRole: displayRoleFromUser(u),
            status: u.status === 'active' ? 'Active' : 'Inactive',
            statusRaw: u.status,
            rating,
            appointments: countMap.get(id) || 0,
            joined: formatJoined(u.joinedDate || u.createdAt),
            outletName: u.outletId?.name || null,
            specialist: u.specialist || '',
        };
    });

    const totalStaff = users.length;
    const activeStaff = users.filter((u) => u.status === 'active').length;

    return {
        stats: {
            totalStaff,
            activeNow: activeStaff,
            onLeave: onLeaveCount,
            pendingInvitations: 0,
        },
        members,
        revenueGrowth: revenueGrowth || [],
        generatedAt: new Date().toISOString(),
    };
}

/**
 * Manager home (/manager): team KPIs, staff performance (MTD), radar + bar data, recent feedback.
 */
async function getManagerDashboard(tenantId) {
    const tid = toTenantObjectId(tenantId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const startYmd = ymdLocal(monthStart);
    const endYmd = ymdLocal(now);

    const [hrData, activeStaff, presentToday, ratingAgg, recentFb] = await Promise.all([
        hrPerformanceService.getStaffPerformance(tenantId, startYmd, endYmd),
        User.countDocuments({ tenantId: tid, status: 'active', role: { $nin: ['superadmin'] } }),
        Attendance.countDocuments({
            tenantId: tid,
            date: endYmd,
            checkInAt: { $exists: true, $ne: null },
        }),
        Feedback.aggregate([
            {
                $match: {
                    tenantId: tid,
                    createdAt: { $gte: monthStart, $lte: now },
                },
            },
            { $group: { _id: null, avg: { $avg: '$rating' } } },
        ]),
        Feedback.find({ tenantId: tid })
            .sort({ createdAt: -1 })
            .limit(8)
            .select('customerName staffName rating comment createdAt')
            .lean(),
    ]);

    const staffRaw = hrData?.staff || [];
    const staffPerformance = staffRaw.map((s) => {
        const goal = Number(s.goal) || hrPerformanceService.DEFAULT_GOAL;
        const revenue = Number(s.revenue) || 0;
        const targetPct = goal > 0 ? Math.min(100, Math.round((revenue / goal) * 100)) : 0;
        const ratingVal = s.rating != null ? Math.round(Number(s.rating) * 10) / 10 : null;
        const feedbackScore = ratingVal != null ? Math.min(100, Math.round(ratingVal * 20)) : 0;
        return {
            id: s.id,
            name: s.staff,
            role: formatRoleLabel(s.role),
            services: Number(s.services) || 0,
            revenue,
            rating: ratingVal,
            target: targetPct,
            efficiency: targetPct,
            feedback: feedbackScore,
        };
    });

    const withWork = staffPerformance.filter((r) => r.services > 0);
    const monthlyTargetPct =
        withWork.length > 0
            ? Math.round(withWork.reduce((acc, r) => acc + r.target, 0) / withWork.length)
            : 0;

    const avgR = ratingAgg[0]?.avg;
    const avgRating =
        avgR != null && !Number.isNaN(Number(avgR)) ? Math.round(Number(avgR) * 10) / 10 : null;

    const performanceComparison =
        staffPerformance.length > 0
            ? staffPerformance.slice(0, 8).map((p) => ({
                  subject: (p.name || '?').split(/\s+/)[0],
                  Revenue: Math.min(100, Math.round((p.revenue || 0) / 500)),
                  Efficiency: p.efficiency,
                  Feedback: p.feedback,
                  fullMark: 100,
              }))
            : [
                  {
                      subject: '—',
                      Revenue: 0,
                      Efficiency: 0,
                      Feedback: 0,
                      fullMark: 100,
                  },
              ];

    const recentFeedback = (recentFb || []).map((f) => ({
        id: String(f._id),
        customer: f.customerName || 'Customer',
        stylist: f.staffName || '—',
        rating: f.rating,
        comment: f.comment || '',
    }));

    return {
        overview: {
            activeStaff,
            presentToday,
            avgRating,
            monthlyTargetPercent: monthlyTargetPct,
        },
        staffPerformance,
        performanceComparison,
        recentFeedback,
        period: { startDate: startYmd, endDate: endYmd },
        generatedAt: new Date().toISOString(),
    };
}

export default {
    getSalonDashboard,
    getManagerDashboard,
    getManagerTeam,
};
