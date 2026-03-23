import httpStatus from 'http-status-codes';
import shiftService from './shift.service.js';

const requireTenant = (req, res) => {
    if (!req.tenantId) {
        res.status(httpStatus.BAD_REQUEST).send({
            success: false,
            message: 'Tenant required. For superadmin, send X-Tenant-Id header.',
        });
        return false;
    }
    return true;
};

const list = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const list = await shiftService.listShifts(req.tenantId);
        res.status(httpStatus.OK).send({ success: true, data: list });
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const doc = await shiftService.createShift(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send({ success: true, data: doc });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const { shiftId } = req.params;
        const doc = await shiftService.updateShift(req.tenantId, shiftId, req.body);
        if (!doc) return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'Shift not found' });
        res.status(httpStatus.OK).send({ success: true, data: doc });
    } catch (error) {
        next(error);
    }
};

const updateRoster = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const { shiftId } = req.params;
        const { userIds } = req.body;
        const doc = await shiftService.updateRoster(req.tenantId, shiftId, userIds);
        if (!doc) return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'Shift not found' });
        res.status(httpStatus.OK).send({ success: true, data: doc });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const { shiftId } = req.params;
        const ok = await shiftService.deleteShift(req.tenantId, shiftId);
        if (!ok) return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'Shift not found' });
        res.status(httpStatus.OK).send({ success: true, message: 'Shift deleted' });
    } catch (error) {
        next(error);
    }
};

export default {
    list,
    create,
    update,
    updateRoster,
    remove,
};
