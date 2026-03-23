import httpStatus from 'http-status-codes';
import hrPerformanceService from './hrPerformance.service.js';

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
        const { startDate, endDate } = req.query;
        const data = await hrPerformanceService.getStaffPerformance(req.tenantId, startDate, endDate);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const patchGoal = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const { userId } = req.params;
        const { goal } = req.body;
        const updated = await hrPerformanceService.setPerformanceGoal(req.tenantId, userId, goal);
        res.status(httpStatus.OK).send({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

export default {
    list,
    patchGoal,
};
