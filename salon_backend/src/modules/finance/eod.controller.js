import httpStatus from 'http-status-codes';
import eodService from './eod.service.js';

const getSummary = async (req, res, next) => {
    try {
        const data = await eodService.getSummary(req.tenantId, req.query);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const closeDay = async (req, res, next) => {
    try {
        const data = await eodService.closeDay(req.tenantId, req.body || {}, req.user || {});
        res.status(httpStatus.CREATED).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const listHistory = async (req, res, next) => {
    try {
        const data = await eodService.listHistory(req.tenantId, req.query);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export default {
    getSummary,
    closeDay,
    listHistory,
};
