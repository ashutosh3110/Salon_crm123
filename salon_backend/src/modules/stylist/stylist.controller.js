import httpStatus from 'http-status-codes';
import stylistCommissionService from './stylistCommission.service.js';
import stylistTimeOffService from './stylistTimeOff.service.js';
import stylistOverviewService from './stylistOverview.service.js';

function stylistUserId(req) {
    const u = req.user;
    if (!u) return null;
    return u._id ?? u.id;
}

const getCommissions = async (req, res, next) => {
    try {
        if (!req.tenantId) {
            return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'Tenant required' });
        }
        const uid = stylistUserId(req);
        if (!uid) {
            return res.status(httpStatus.UNAUTHORIZED).send({ success: false, message: 'User required' });
        }
        const data = await stylistCommissionService.getStylistCommissionDashboard(req.tenantId, uid, req.query);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getTimeOff = async (req, res, next) => {
    try {
        if (!req.tenantId) {
            return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'Tenant required' });
        }
        const uid = stylistUserId(req);
        if (!uid) {
            return res.status(httpStatus.UNAUTHORIZED).send({ success: false, message: 'User required' });
        }
        const data = await stylistTimeOffService.getDashboard(req.tenantId, uid);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getOverview = async (req, res, next) => {
    try {
        if (!req.tenantId) {
            return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'Tenant required' });
        }
        const uid = stylistUserId(req);
        if (!uid) {
            return res.status(httpStatus.UNAUTHORIZED).send({ success: false, message: 'User required' });
        }
        const data = await stylistOverviewService.getOverview(req.tenantId, uid, req.query);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const createTimeOff = async (req, res, next) => {
    try {
        if (!req.tenantId) {
            return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'Tenant required' });
        }
        const uid = stylistUserId(req);
        if (!uid) {
            return res.status(httpStatus.UNAUTHORIZED).send({ success: false, message: 'User required' });
        }
        const row = await stylistTimeOffService.createRequest(req.tenantId, uid, req.body);
        res.status(httpStatus.CREATED).send({ success: true, data: row });
    } catch (error) {
        next(error);
    }
};

export default {
    getCommissions,
    getOverview,
    getTimeOff,
    createTimeOff,
};
