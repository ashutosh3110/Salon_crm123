import mongoose from 'mongoose';
import Booking from '../booking/booking.model.js';
import User from '../user/user.model.js';
import Feedback from '../feedback/feedback.model.js';

const DEFAULT_GOAL = 100000;

function toOid(id) {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        return null;
    }
}

function parseRange(startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);
    return { start, end };
}

function tierFromAchievement(ratio) {
    if (ratio >= 1) return 'Elite';
    if (ratio >= 0.8) return 'High';
    if (ratio >= 0.5) return 'Medium';
    return 'Low';
}

/**
 * Staff performance for HR: completed booking revenue & counts, optional feedback-based rating, goals.
 */
async function getStaffPerformance(tenantId, startDate, endDate) {
    const tid = toOid(tenantId);
    if (!tid) {
        const err = new Error('Invalid tenant');
        err.statusCode = 400;
        throw err;
    }

    const { start, end } = parseRange(startDate, endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
        const err = new Error('Invalid date range');
        err.statusCode = 400;
        throw err;
    }

    const bookingAgg = await Booking.aggregate([
        {
            $match: {
                tenantId: tid,
                status: 'completed',
                appointmentDate: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: '$staffId',
                revenue: { $sum: '$price' },
                services: { $sum: 1 },
            },
        },
    ]);

    const statsByStaff = new Map(bookingAgg.map((x) => [x._id.toString(), x]));

    const users = await User.find({
        tenantId: tid,
        role: { $nin: ['superadmin'] },
        status: 'active',
    })
        .select('name role performanceGoal')
        .lean();

    const feedbackAgg = await Feedback.aggregate([
        {
            $match: {
                tenantId: tid,
                createdAt: { $gte: start, $lte: end },
                staffName: { $nin: ['', null] },
            },
        },
        {
            $group: {
                _id: { $toLower: { $trim: { input: '$staffName' } } },
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 },
            },
        },
    ]);
    const ratingByName = new Map(feedbackAgg.map((x) => [x._id, { avg: x.avgRating, count: x.count }]));

    const staff = users.map((u) => {
        const id = u._id.toString();
        const b = statsByStaff.get(id) || { revenue: 0, services: 0 };
        const revenue = Math.round(Number(b.revenue || 0) * 100) / 100;
        const services = Number(b.services || 0);
        const nameKey = (u.name || '').trim().toLowerCase();
        const fr = nameKey ? ratingByName.get(nameKey) : null;
        const rating =
            fr && fr.count > 0 && fr.avg != null ? Math.round(Number(fr.avg) * 10) / 10 : null;
        const goal =
            u.performanceGoal != null && Number(u.performanceGoal) > 0
                ? Number(u.performanceGoal)
                : DEFAULT_GOAL;
        const ach = goal > 0 ? revenue / goal : 0;
        const contribution = tierFromAchievement(ach);

        return {
            id,
            staff: u.name,
            role: u.role,
            revenue,
            services,
            rating,
            goal,
            contribution,
        };
    });

    staff.sort((a, b) => b.revenue - a.revenue);

    return {
        period: { startDate, endDate },
        staff,
        defaultGoal: DEFAULT_GOAL,
    };
}

async function setPerformanceGoal(tenantId, userId, goal) {
    const tid = toOid(tenantId);
    const uid = toOid(userId);
    if (!tid || !uid) {
        const err = new Error('Invalid id');
        err.statusCode = 400;
        throw err;
    }

    const user = await User.findOne({ _id: uid, tenantId: tid });
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    user.performanceGoal = Number(goal);
    await user.save();

    return { userId: user._id.toString(), goal: user.performanceGoal };
}

export default {
    getStaffPerformance,
    setPerformanceGoal,
    DEFAULT_GOAL,
};
