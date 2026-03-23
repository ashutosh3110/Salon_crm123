import mongoose from 'mongoose';
import httpStatus from 'http-status-codes';
import Shift from './shift.model.js';
import Outlet from '../outlet/outlet.model.js';
import User from '../user/user.model.js';

function toOid(id) {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        return null;
    }
}

async function assertOutletInTenant(tenantId, outletId) {
    const tid = toOid(tenantId);
    const oid = toOid(outletId);
    if (!tid || !oid) {
        const err = new Error('Invalid outlet');
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
    }
    const o = await Outlet.findOne({ _id: oid, tenantId: tid });
    if (!o) {
        const err = new Error('Outlet not found in this tenant');
        err.statusCode = httpStatus.NOT_FOUND;
        throw err;
    }
    return o;
}

async function assertUsersInTenant(tenantId, userIds) {
    const tid = toOid(tenantId);
    if (!tid || !userIds?.length) return;
    const ids = userIds.map(toOid).filter(Boolean);
    const count = await User.countDocuments({ _id: { $in: ids }, tenantId: tid });
    if (count !== ids.length) {
        const err = new Error('One or more staff are not in this tenant');
        err.statusCode = httpStatus.BAD_REQUEST;
        throw err;
    }
}

const listShifts = async (tenantId) => {
    const tid = toOid(tenantId);
    return Shift.find({ tenantId: tid })
        .populate('outletId', 'name')
        .populate('assignedUserIds', 'name email role')
        .sort({ createdAt: -1 })
        .lean();
};

const getShiftById = async (tenantId, shiftId) => {
    const tid = toOid(tenantId);
    const sid = toOid(shiftId);
    return Shift.findOne({ _id: sid, tenantId: tid })
        .populate('outletId', 'name')
        .populate('assignedUserIds', 'name email role')
        .lean();
};

const createShift = async (tenantId, body) => {
    await assertOutletInTenant(tenantId, body.outletId);
    if (body.assignedUserIds?.length) {
        await assertUsersInTenant(tenantId, body.assignedUserIds);
    }
    const tid = toOid(tenantId);
    const doc = await Shift.create({
        tenantId: tid,
        name: body.name,
        startTime: body.startTime,
        endTime: body.endTime,
        outletId: body.outletId,
        colorHex: body.colorHex || '#10b981',
        colorClass: body.colorClass || 'bg-emerald-500',
        dayOfWeek: body.dayOfWeek,
        date: body.date,
        status: body.status || 'Active',
        assignedUserIds: body.assignedUserIds?.length ? body.assignedUserIds : [],
    });
    return getShiftById(tenantId, doc._id);
};

const updateShift = async (tenantId, shiftId, body) => {
    const existing = await getShiftById(tenantId, shiftId);
    if (!existing) return null;
    if (body.outletId) await assertOutletInTenant(tenantId, body.outletId);

    const patch = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.startTime !== undefined) patch.startTime = body.startTime;
    if (body.endTime !== undefined) patch.endTime = body.endTime;
    if (body.outletId !== undefined) patch.outletId = body.outletId;
    if (body.colorHex !== undefined) patch.colorHex = body.colorHex;
    if (body.colorClass !== undefined) patch.colorClass = body.colorClass;
    if (body.dayOfWeek !== undefined) patch.dayOfWeek = body.dayOfWeek;
    if (body.date !== undefined) patch.date = body.date;
    if (body.status !== undefined) patch.status = body.status;
    if (body.assignedUserIds !== undefined) {
        await assertUsersInTenant(tenantId, body.assignedUserIds);
        patch.assignedUserIds = body.assignedUserIds;
    }

    const tid = toOid(tenantId);
    const sid = toOid(shiftId);
    await Shift.updateOne({ _id: sid, tenantId: tid }, { $set: patch });
    return getShiftById(tenantId, shiftId);
};

const updateRoster = async (tenantId, shiftId, userIds) => {
    await assertUsersInTenant(tenantId, userIds || []);
    return updateShift(tenantId, shiftId, { assignedUserIds: userIds || [] });
};

const deleteShift = async (tenantId, shiftId) => {
    const tid = toOid(tenantId);
    const sid = toOid(shiftId);
    const res = await Shift.deleteOne({ _id: sid, tenantId: tid });
    return res.deletedCount > 0;
};

export default {
    listShifts,
    getShiftById,
    createShift,
    updateShift,
    updateRoster,
    deleteShift,
};
