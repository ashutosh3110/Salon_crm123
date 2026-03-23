import httpStatus from 'http-status-codes';
import payrollService from './payroll.service.js';

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

const parseYm = (req) => {
    const year = Number(req.query.year ?? req.body.year);
    const month = Number(req.query.month ?? req.body.month);
    if (!year || !month || month < 1 || month > 12) {
        return null;
    }
    return { year, month };
};

const getMonth = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const ym = parseYm(req);
        if (!ym) {
            return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'year and month (1-12) required' });
        }
        const data = await payrollService.getMonthData(req.tenantId, ym.year, ym.month);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const generate = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const ym = parseYm(req);
        if (!ym) {
            return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'year and month required' });
        }
        const data = await payrollService.generateEntries(req.tenantId, ym.year, ym.month);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const setLocked = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const ym = parseYm(req);
        if (!ym) {
            return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'year and month required' });
        }
        const { locked } = req.body;
        const period = await payrollService.setPeriodLocked(req.tenantId, ym.year, ym.month, !!locked);
        res.status(httpStatus.OK).send({ success: true, data: period });
    } catch (error) {
        next(error);
    }
};

const patchEntry = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const { entryId } = req.params;
        const doc = await payrollService.updateEntry(req.tenantId, entryId, req.body);
        res.status(httpStatus.OK).send({ success: true, data: doc });
    } catch (error) {
        next(error);
    }
};

const markAllPaid = async (req, res, next) => {
    try {
        if (!requireTenant(req, res)) return;
        const ym = parseYm(req);
        if (!ym) {
            return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'year and month required' });
        }
        const data = await payrollService.markAllPaid(req.tenantId, ym.year, ym.month);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export default {
    getMonth,
    generate,
    setLocked,
    patchEntry,
    markAllPaid,
};
