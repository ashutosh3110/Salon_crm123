import mongoose from 'mongoose';
import Booking from '../booking/booking.model.js';
import User from '../user/user.model.js';
import Attendance from '../attendance/attendance.model.js';
import Feedback from '../feedback/feedback.model.js';

function escapeRegex(s) {
    return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const DEFAULT_GOAL = 100000;

function toOid(id) {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        return null;
    }
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function ymdLocal(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function dayBoundsFromYmd(ymd) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || '').trim());
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const da = Number(m[3]);
    const start = new Date(y, mo - 1, da, 0, 0, 0, 0);
    const end = new Date(y, mo - 1, da, 23, 59, 59, 999);
    return { start, end };
}

function formatTime12(d) {
    if (!d) return '—';
    const x = new Date(d);
    return x.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
}

function formatShortDay(d) {
    return new Date(d).toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase().slice(0, 3);
}

/**
 * Last 7 calendar days: completed booking revenue per day (same basis as MTD goal progress).
 */
async function buildLast7DaysPerformance(tid, sid) {
    const dayMetas = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        dayMetas.push({ d, ds: ymdLocal(d), label: formatShortDay(d) });
    }
    const rangeStart = dayMetas[0].d;
    const rangeEnd = new Date(dayMetas[dayMetas.length - 1].d);
    rangeEnd.setHours(23, 59, 59, 999);

    const bookingByDay = await Booking.aggregate([
        {
            $match: {
                tenantId: tid,
                staffId: sid,
                status: 'completed',
                appointmentDate: { $gte: rangeStart, $lte: rangeEnd },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } },
                value: { $sum: '$price' },
                count: { $sum: 1 },
            },
        },
    ]);

    const bMap = new Map(bookingByDay.map((x) => [x._id, x]));

    return dayMetas.map(({ ds, label }) => {
        const b = bMap.get(ds) || { value: 0, count: 0 };
        return {
            day: label,
            value: Math.round(Number(b.value || 0) * 100) / 100,
            count: Number(b.count || 0),
        };
    });
}

/**
 * Dashboard overview: MTD revenue vs goal, 7-day performance bars, today's schedule, recent attendance, shift flag.
 */
async function getOverview(tenantId, stylistUserId, query = {}) {
    const tid = toOid(tenantId);
    const sid = toOid(stylistUserId);
    if (!tid || !sid) {
        const err = new Error('Invalid tenant or user');
        err.statusCode = 400;
        throw err;
    }

    const scheduleDay = query.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date) ? query.date : ymdLocal(new Date());
    const bounds = dayBoundsFromYmd(scheduleDay);
    if (!bounds) {
        const err = new Error('Invalid date');
        err.statusCode = 400;
        throw err;
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const user = await User.findOne({ _id: sid, tenantId: tid }).select('name performanceGoal').lean();
    const staffNamePattern =
        user?.name && String(user.name).trim()
            ? new RegExp(`^${escapeRegex(user.name.trim())}$`, 'i')
            : null;
    const target =
        user?.performanceGoal != null && Number(user.performanceGoal) > 0
            ? Number(user.performanceGoal)
            : DEFAULT_GOAL;

    const [mtdAgg, monthDaily, weekDays, todayBookings, feedbackAvg, attendanceRows, todayAttendance] =
        await Promise.all([
            Booking.aggregate([
                {
                    $match: {
                        tenantId: tid,
                        staffId: sid,
                        status: 'completed',
                        appointmentDate: { $gte: monthStart, $lte: now },
                    },
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$price' },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Booking.aggregate([
                {
                    $match: {
                        tenantId: tid,
                        staffId: sid,
                        status: 'completed',
                        appointmentDate: { $gte: monthStart, $lte: now },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' },
                        },
                        value: { $sum: '$price' },
                        count: { $sum: 1 },
                    },
                },
            ]),
            buildLast7DaysPerformance(tid, sid),
            Booking.find({
                tenantId: tid,
                staffId: sid,
                appointmentDate: { $gte: bounds.start, $lte: bounds.end },
            })
                .populate('clientId', 'name')
                .populate('serviceId', 'name')
                .sort({ appointmentDate: 1 })
                .lean(),
            staffNamePattern
                ? Feedback.aggregate([
                      {
                          $match: {
                              tenantId: tid,
                              createdAt: { $gte: monthStart, $lte: now },
                              staffName: staffNamePattern,
                          },
                      },
                      { $group: { _id: null, avg: { $avg: '$rating' } } },
                  ])
                : Promise.resolve([]),
            Attendance.find({
                tenantId: tid,
                userId: sid,
                date: {
                    $gte: ymdLocal(new Date(Date.now() - 14 * 86400000)),
                },
            })
                .sort({ date: -1, updatedAt: -1 })
                .limit(20)
                .lean(),
            Attendance.findOne({
                tenantId: tid,
                userId: sid,
                date: scheduleDay,
            }).lean(),
        ]);

    const revenue = mtdAgg[0]?.revenue || 0;
    const servicesDone = mtdAgg[0]?.count || 0;
    const progressPercent = target > 0 ? Math.min(100, Math.round((revenue / target) * 100)) : 0;

    let highestDaily = 0;
    for (const row of monthDaily) {
        if (row.value > highestDaily) highestDaily = row.value;
    }

    const rating =
        feedbackAvg[0]?.avg != null && !Number.isNaN(feedbackAvg[0].avg)
            ? Math.round(feedbackAvg[0].avg * 10) / 10
            : null;

    const schedule = todayBookings.map((b) => {
        const cid = b.clientId?.name || 'Client';
        const svc = b.serviceId?.name || 'Service';
        const idStr = b._id.toString();
        const sector = `STATION_${idStr.slice(-4).toUpperCase()}`;
        return {
            id: idStr,
            time: formatTime12(b.appointmentDate),
            customer: String(cid).toUpperCase(),
            service: String(svc).toUpperCase(),
            duration: `${b.duration || 0} MIN`,
            bookingStatus: b.status,
            sector,
        };
    });

    const attendanceLog = [];
    for (const row of attendanceRows) {
        const dayLabel = row.date
            ? new Date(`${row.date}T12:00:00`)
                  .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  .toUpperCase()
                  .replace(/\s/g, ' ')
            : '';
        if (row.checkInAt) {
            attendanceLog.push({
                type: 'in',
                ts: new Date(row.checkInAt).getTime(),
                time: formatTime12(row.checkInAt),
                date: dayLabel,
                statusLabel: 'PUNCHED IN',
            });
        }
        if (row.checkOutAt) {
            attendanceLog.push({
                type: 'out',
                ts: new Date(row.checkOutAt).getTime(),
                time: formatTime12(row.checkOutAt),
                date: dayLabel,
                statusLabel: 'PUNCHED OUT',
            });
        }
    }
    attendanceLog.sort((a, b) => b.ts - a.ts);
    attendanceLog.forEach((e) => {
        delete e.ts;
    });

    const shiftActive = !!(todayAttendance?.checkInAt && !todayAttendance?.checkOutAt);

    return {
        scheduleDate: scheduleDay,
        stats: {
            revenue,
            target,
            progressPercent,
            servicesDone,
            highestDaily,
            rating,
        },
        performanceData: weekDays,
        schedule,
        attendanceLog: attendanceLog.slice(0, 8),
        shiftActive,
    };
}

export default {
    getOverview,
};
