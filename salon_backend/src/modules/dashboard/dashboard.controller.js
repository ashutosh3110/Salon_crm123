import httpStatus from 'http-status-codes';
import dashboardService from './dashboard.service.js';

const getSalonDashboard = async (req, res, next) => {
    try {
        if (!req.tenantId) {
            return res.status(httpStatus.BAD_REQUEST).send({
                success: false,
                message: 'Tenant required',
            });
        }
        const data = await dashboardService.getSalonDashboard(req.tenantId);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getManagerDashboard = async (req, res, next) => {
    try {
        if (!req.tenantId) {
            return res.status(httpStatus.BAD_REQUEST).send({
                success: false,
                message: 'Tenant required',
            });
        }
        const data = await dashboardService.getManagerDashboard(req.tenantId);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getManagerTeam = async (req, res, next) => {
    try {
        if (!req.tenantId) {
            return res.status(httpStatus.BAD_REQUEST).send({
                success: false,
                message: 'Tenant required',
            });
        }
        const data = await dashboardService.getManagerTeam(req.tenantId);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export default {
    getSalonDashboard,
    getManagerDashboard,
    getManagerTeam,
};
