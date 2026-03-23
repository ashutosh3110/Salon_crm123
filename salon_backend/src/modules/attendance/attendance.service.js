import mongoose from 'mongoose';
import httpStatus from 'http-status-codes';
import Attendance, { STATUS_VALUES } from './attendance.model.js';
import User from '../user/user.model.js';
import { haversineMeters } from '../../utils/geo.js';

function combineDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const parts = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!parts) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return null;
    const hh = Number(parts[1]);
    const mm = Number(parts[2]);
    return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function computeHoursWorked(checkInAt, checkOutAt) {
    if (!checkInAt || !checkOutAt) return 0;
    const ms = new Date(checkOutAt) - new Date(checkInAt);
    if (ms <= 0) return 0;
    return Math.round((ms / 3600000) * 100) / 100;
}

async function assertUserInTenant(tenantId, userId) {
    const uid = new mongoose.Types.ObjectId(userId);
    const tid = new mongoose.Types.ObjectId(tenantId);
    const user = await User.findOne({ _id: uid, tenantId: tid });
    if (!user) {
        const err = new Error('User not found in this tenant');
        err.statusCode = httpStatus.NOT_FOUND;
        throw err;
    }
    return user;
}

const OUTLET_POPULATE = {
    path: 'outletId',
    select: 'name address latitude longitude geofenceRadiusMeters city status',
};

async function loadUserWithOutlet(tenantId, userId) {
    const uid = new mongoose.Types.ObjectId(userId);
    const tid = new mongoose.Types.ObjectId(tenantId);
    return User.findOne({ _id: uid, tenantId: tid }).populate(OUTLET_POPULATE);
}

/**
 * Stylist: assigned outlet + coords for geofenced punch. Other roles: enforcement off.
 */
const getWorksiteContext = async (tenantId, userId) => {
    const user = await loadUserWithOutlet(tenantId, userId);
    if (!user) {
        const err = new Error('User not found in this tenant');
        err.statusCode = httpStatus.NOT_FOUND;
        throw err;
    }

    if (user.role !== 'stylist') {
        return {
            geofenceEnforced: false,
            outlet: null,
            configured: true,
        };
    }

    const outlet = user.outletId;
    if (!outlet) {
        return {
            geofenceEnforced: true,
            outlet: null,
            configured: false,
            code: 'NO_OUTLET',
            message: 'No outlet is assigned to your account. Ask your salon admin to assign you to an outlet.',
        };
    }

    const o = outlet.toObject ? outlet.toObject() : outlet;
    const hasCoords = o.latitude != null && o.longitude != null && !Number.isNaN(Number(o.latitude)) && !Number.isNaN(Number(o.longitude));
    const radius = o.geofenceRadiusMeters ?? 200;

    return {
        geofenceEnforced: true,
        outlet: {
            id: o._id,
            name: o.name,
            address: o.address,
            city: o.city,
            latitude: hasCoords ? o.latitude : null,
            longitude: hasCoords ? o.longitude : null,
            geofenceRadiusMeters: radius,
            status: o.status,
        },
        configured: hasCoords,
        code: hasCoords ? undefined : 'OUTLET_NO_COORDS',
        message: hasCoords
            ? undefined
            : 'This outlet has no map coordinates yet. Ask your admin to save the outlet location (latitude/longitude).',
    };
};

function assertStylistWithinOutletGeofence(user, latitude, longitude) {
    const outlet = user.outletId;
    if (!outlet) {
        const err = new Error(
            'No outlet is assigned to your account. Ask your salon admin to assign you to an outlet before punching attendance.'
        );
        err.statusCode = httpStatus.FORBIDDEN;
        throw err;
    }
    const o = outlet.toObject ? outlet.toObject() : outlet;
    if (o.status === 'inactive') {
        const err = new Error('Your assigned outlet is inactive. Contact your salon admin.');
        err.statusCode = httpStatus.FORBIDDEN;
        throw err;
    }
    if (o.latitude == null || o.longitude == null) {
        const err = new Error(
            'Your outlet location is not configured on the map. Ask your admin to set the outlet coordinates before you can punch.'
        );
        err.statusCode = httpStatus.FORBIDDEN;
        throw err;
    }
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
        const err = new Error('Valid GPS latitude and longitude are required to punch.');
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
    }
    const radius = Number(o.geofenceRadiusMeters) > 0 ? Number(o.geofenceRadiusMeters) : 200;
    const dist = haversineMeters(lat, lng, o.latitude, o.longitude);
    if (Number.isNaN(dist) || dist > radius) {
        const err = new Error(
            `You are outside the allowed ${radius}m radius of "${o.name}". Move to the outlet location to punch in or out.`
        );
        err.statusCode = httpStatus.FORBIDDEN;
        throw err;
    }
}

async function listStaffUserIds(tenantId) {
    const tid = new mongoose.Types.ObjectId(tenantId);
    const users = await User.find({
        tenantId: tid,
        role: { $nin: ['superadmin'] },
    })
        .select('_id')
        .lean();
    return users.map((u) => u._id.toString());
}

/**
 * List attendance rows for a date (with populated user + outlet name).
 */
const listByDate = async (tenantId, date) => {
    const tid = new mongoose.Types.ObjectId(tenantId);
    return Attendance.find({ tenantId: tid, date })
        .populate({
            path: 'userId',
            select: 'name email role outletId phone status',
            populate: { path: 'outletId', select: 'name' },
        })
        .sort({ createdAt: -1 })
        .lean();
};

const getMineForDate = async (tenantId, userId, date) => {
    const tid = new mongoose.Types.ObjectId(tenantId);
    const uid = new mongoose.Types.ObjectId(userId);
    return Attendance.findOne({ tenantId: tid, userId: uid, date })
        .populate({
            path: 'userId',
            select: 'name email role outletId',
            populate: { path: 'outletId', select: 'name' },
        })
        .lean();
};

const upsertRecord = async (tenantId, payload) => {
    const {
        userId,
        date,
        status,
        checkIn,
        checkOut,
        remark,
        location,
    } = payload;

    if (!STATUS_VALUES.includes(status)) {
        const err = new Error(`Invalid status`);
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
    }

    await assertUserInTenant(tenantId, userId);

    const tid = new mongoose.Types.ObjectId(tenantId);
    const uid = new mongoose.Types.ObjectId(userId);

    const existing = await Attendance.findOne({ tenantId: tid, userId: uid, date }).lean();

    let checkInAt = existing?.checkInAt ? new Date(existing.checkInAt) : null;
    let checkOutAt = existing?.checkOutAt ? new Date(existing.checkOutAt) : null;

    if (checkIn !== undefined) {
        checkInAt = checkIn ? combineDateTime(date, checkIn) : null;
    }
    if (checkOut !== undefined) {
        checkOutAt = checkOut ? combineDateTime(date, checkOut) : null;
    }

    if (status === 'absent' || status === 'leave') {
        checkInAt = null;
        checkOutAt = null;
    }

    const hoursWorked = computeHoursWorked(checkInAt, checkOutAt);

    const update = {
        status,
        checkInAt,
        checkOutAt,
        hoursWorked,
    };
    if (remark !== undefined) update.remark = String(remark || '').slice(0, 2000);
    if (location !== undefined) update.location = String(location || 'Salon').slice(0, 200);

    const doc = await Attendance.findOneAndUpdate(
        { tenantId: tid, userId: uid, date },
        {
            $set: update,
            $setOnInsert: { tenantId: tid, userId: uid, date },
        },
        { new: true, upsert: true, runValidators: true }
    ).populate({
        path: 'userId',
        select: 'name email role outletId phone status',
        populate: { path: 'outletId', select: 'name' },
    });

    return doc;
};

const bulkSetStatus = async (tenantId, { date, status, userIds, defaultCheckIn, defaultCheckOut }) => {
    if (!STATUS_VALUES.includes(status)) {
        const err = new Error('Invalid status');
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
    }

    let ids = userIds;
    if (!ids || !ids.length) {
        ids = await listStaffUserIds(tenantId);
    } else {
        for (const id of ids) {
            await assertUserInTenant(tenantId, id);
        }
    }

    const results = [];
    for (const id of ids) {
        const payload = { userId: id, date, status };
        if (status === 'present' || status === 'late' || status === 'half-day') {
            if (defaultCheckIn) payload.checkIn = defaultCheckIn;
            if (defaultCheckOut) payload.checkOut = defaultCheckOut;
        }
        const doc = await upsertRecord(tenantId, payload);
        results.push(doc);
    }
    return results;
};

/**
 * Self-service punch: IN sets check-in; OUT sets check-out and hours.
 * Stylists must punch only from within their assigned outlet geofence (GPS required).
 */
const punch = async (tenantId, userId, { type, date, location, latitude, longitude }) => {
    const day = date || new Date().toISOString().split('T')[0];
    const user = await loadUserWithOutlet(tenantId, userId);
    if (!user) {
        const err = new Error('User not found in this tenant');
        err.statusCode = httpStatus.NOT_FOUND;
        throw err;
    }
    if (user.role === 'stylist') {
        assertStylistWithinOutletGeofence(user, latitude, longitude);
    }

    const tid = new mongoose.Types.ObjectId(tenantId);
    const uid = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    let doc = await Attendance.findOne({ tenantId: tid, userId: uid, date: day });

    if (type === 'in') {
        if (!doc) {
            doc = new Attendance({
                tenantId: tid,
                userId: uid,
                date: day,
                status: 'present',
                checkInAt: now,
                checkOutAt: null,
                hoursWorked: 0,
                location: location || 'Salon',
            });
        } else {
            doc.checkInAt = now;
            doc.status = doc.status === 'absent' || doc.status === 'leave' ? 'present' : doc.status;
            if (location) doc.location = location;
        }
        await doc.save();
    } else if (type === 'out') {
        if (!doc) {
            const err = new Error('No check-in found for this date');
            err.statusCode = httpStatus.BAD_REQUEST;
            throw err;
        }
        doc.checkOutAt = now;
        doc.hoursWorked = computeHoursWorked(doc.checkInAt, doc.checkOutAt);
        if (location) doc.location = location;
        await doc.save();
    } else {
        const err = new Error('type must be in or out');
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
    }

    return Attendance.findById(doc._id)
        .populate({
            path: 'userId',
            select: 'name email role outletId',
            populate: { path: 'outletId', select: 'name' },
        })
        .lean();
};

export default {
    listByDate,
    getMineForDate,
    getWorksiteContext,
    upsertRecord,
    bulkSetStatus,
    punch,
    STATUS_VALUES,
};
