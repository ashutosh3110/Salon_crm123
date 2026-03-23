import mongoose from 'mongoose';
import LeaveRequest, { LEAVE_TYPES } from './leaveRequest.model.js';

/** Default annual caps (used until tenant-specific HR settings exist) */
export const LEAVE_QUOTA_TOTALS = {
    CASUAL_LEAVE: 12,
    MEDICAL_LEAVE: 8,
    PAID_LEAVE: 15,
    SICK_BUFFER: 5,
};

const LABEL_BY_TYPE = {
    CASUAL_LEAVE: 'Casual Leaves',
    MEDICAL_LEAVE: 'Medical Leaves',
    PAID_LEAVE: 'Earned Leaves',
    SICK_BUFFER: 'Short Leaves',
};

const COLOR_BY_TYPE = {
    CASUAL_LEAVE: 'text-primary',
    MEDICAL_LEAVE: 'text-rose-500',
    PAID_LEAVE: 'text-emerald-500',
    SICK_BUFFER: 'text-amber-500',
};

function pad2(n) {
    return String(n).padStart(2, '0');
}

function formatDayMonth(dateStr) {
    const d = new Date(`${dateStr}T12:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    const day = pad2(d.getDate());
    const month = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
    return `${day} ${month}`;
}

function formatRange(startDate, endDate) {
    if (!startDate || !endDate) return '—';
    if (startDate === endDate) return formatDayMonth(startDate);
    return `${formatDayMonth(startDate)} - ${formatDayMonth(endDate)}`;
}

function formatAppliedOn(createdAt) {
    if (!createdAt) return '—';
    const d = new Date(createdAt);
    const day = pad2(d.getDate());
    const month = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
    return `${day} ${month}`;
}

function daysInclusive(startYmd, endYmd) {
    const a = new Date(`${startYmd}T12:00:00`);
    const b = new Date(`${endYmd}T12:00:00`);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
    const diff = Math.round((b - a) / (86400 * 1000)) + 1;
    return diff > 0 ? diff : 0;
}

function maxYmd(a, b) {
    return a >= b ? a : b;
}

function minYmd(a, b) {
    return a <= b ? a : b;
}

function mapDocToRow(doc) {
    return {
        id: doc._id.toString(),
        type: doc.type,
        dates: formatRange(doc.startDate, doc.endDate),
        reason: doc.reason || '—',
        status: doc.status,
        appliedOn: formatAppliedOn(doc.createdAt),
        startDate: doc.startDate,
        endDate: doc.endDate,
    };
}

async function computeUsedDaysByType(tenantId, userId, year) {
    const y = year || new Date().getFullYear();
    const yearStart = `${y}-01-01`;
    const yearEnd = `${y}-12-31`;
    const tid = new mongoose.Types.ObjectId(tenantId);
    const uid = new mongoose.Types.ObjectId(userId);

    const rows = await LeaveRequest.find({
        tenantId: tid,
        userId: uid,
        status: 'APPROVED',
    })
        .select('type startDate endDate')
        .lean();

    const used = {};
    LEAVE_TYPES.forEach((t) => {
        used[t] = 0;
    });

    for (const r of rows) {
        const overlapStart = maxYmd(r.startDate, yearStart);
        const overlapEnd = minYmd(r.endDate, yearEnd);
        if (overlapStart <= overlapEnd) {
            used[r.type] += daysInclusive(overlapStart, overlapEnd);
        }
    }
    return used;
}

async function getDashboard(tenantId, userId) {
    const tid = new mongoose.Types.ObjectId(tenantId);
    const uid = new mongoose.Types.ObjectId(userId);

    const [docs, usedByType] = await Promise.all([
        LeaveRequest.find({ tenantId: tid, userId: uid }).sort({ createdAt: -1 }).lean(),
        computeUsedDaysByType(tenantId, userId, new Date().getFullYear()),
    ]);

    const year = new Date().getFullYear();
    const quotas = LEAVE_TYPES.map((type) => ({
        key: type,
        label: LABEL_BY_TYPE[type] || type,
        colorClass: COLOR_BY_TYPE[type] || 'text-text',
        used: usedByType[type] ?? 0,
        total: LEAVE_QUOTA_TOTALS[type] ?? 0,
        year,
    }));

    return {
        requests: docs.map(mapDocToRow),
        leaveTypes: [...LEAVE_TYPES],
        quotas,
    };
}

async function createRequest(tenantId, userId, body) {
    const { type, startDate, endDate, reason } = body;
    if (startDate > endDate) {
        const err = new Error('End date must be on or after start date');
        err.statusCode = 400;
        throw err;
    }

    const doc = await LeaveRequest.create({
        tenantId: new mongoose.Types.ObjectId(tenantId),
        userId: new mongoose.Types.ObjectId(userId),
        type,
        startDate,
        endDate,
        reason: String(reason || '').trim().slice(0, 2000),
        status: 'PENDING',
    });

    return mapDocToRow(doc.toObject());
}

async function listAllTenantRequests(tenantId, filters = {}) {
    const tid = new mongoose.Types.ObjectId(tenantId);
    const query = { tenantId: tid };

    if (filters.status) {
        query.status = filters.status;
    }

    const docs = await LeaveRequest.find(query)
        .populate('userId', 'name role')
        .sort({ createdAt: -1 })
        .lean();

    return docs.map((doc) => ({
        ...mapDocToRow(doc),
        userName: doc.userId?.name || 'Unknown',
        userRole: doc.userId?.role || 'Staff',
    }));
}

async function updateRequestStatus(tenantId, requestId, status, reviewerId, note = '') {
    const tid = new mongoose.Types.ObjectId(tenantId);
    const rid = new mongoose.Types.ObjectId(requestId);

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        const err = new Error('Invalid status');
        err.statusCode = 400;
        throw err;
    }

    const doc = await LeaveRequest.findOneAndUpdate(
        { _id: rid, tenantId: tid },
        {
            status,
            reviewedBy: new mongoose.Types.ObjectId(reviewerId),
            reviewedAt: new Date(),
            reviewNote: note,
        },
        { new: true }
    ).populate('userId', 'name role');

    if (!doc) {
        const err = new Error('Leave request not found');
        err.statusCode = 404;
        throw err;
    }

    return {
        ...mapDocToRow(doc),
        userName: doc.userId?.name || 'Unknown',
        userRole: doc.userId?.role || 'Staff',
    };
}

export default {
    getDashboard,
    createRequest,
    listAllTenantRequests,
    updateRequestStatus,
};
