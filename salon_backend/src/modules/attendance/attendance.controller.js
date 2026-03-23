import httpStatus from 'http-status-codes';
import attendanceService from './attendance.service.js';

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

const listByDate = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const { date } = req.query;
        const list = await attendanceService.listByDate(req.tenantId, date);
        res.status(httpStatus.OK).send({ success: true, data: { date, records: list } });
    } catch (error) {
        next(error);
    }
};

const getMine = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const record = await attendanceService.getMineForDate(req.tenantId, req.user._id, date);
        res.status(httpStatus.OK).send({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

const getWorksite = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const data = await attendanceService.getWorksiteContext(req.tenantId, req.user._id);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const upsert = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const doc = await attendanceService.upsertRecord(req.tenantId, req.body);
        res.status(httpStatus.OK).send({ success: true, data: doc });
    } catch (error) {
        next(error);
    }
};

const bulk = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const list = await attendanceService.bulkSetStatus(req.tenantId, req.body);
        res.status(httpStatus.OK).send({ success: true, data: { count: list.length, records: list } });
    } catch (error) {
        next(error);
    }
};

const punch = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const doc = await attendanceService.punch(req.tenantId, req.user._id, req.body);
        res.status(httpStatus.OK).send({ success: true, data: doc });
    } catch (error) {
        next(error);
    }
};

export default {
    listByDate,
    getMine,
    getWorksite,
    upsert,
    bulk,
    punch,
};
