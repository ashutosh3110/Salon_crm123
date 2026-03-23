import httpStatus from 'http-status-codes';
import pettyCashService from './pettyCash.service.js';

const summary = async (req, res, next) => {
    try {
        const data = await pettyCashService.getSummary(req.tenantId);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const listEntries = async (req, res, next) => {
    try {
        const data = await pettyCashService.listEntries(req.tenantId, req.query);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const listClosings = async (req, res, next) => {
    try {
        const data = await pettyCashService.listClosings(req.tenantId, req.query);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const openDay = async (req, res, next) => {
    try {
        const data = await pettyCashService.openDay(req.tenantId, req.body || {});
        res.status(httpStatus.CREATED).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const addFund = async (req, res, next) => {
    try {
        const data = await pettyCashService.addFund(req.tenantId, req.body || {});
        res.status(httpStatus.CREATED).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const addExpense = async (req, res, next) => {
    try {
        const data = await pettyCashService.addExpense(req.tenantId, req.body || {});
        res.status(httpStatus.CREATED).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const closeDay = async (req, res, next) => {
    try {
        const data = await pettyCashService.closeDay(req.tenantId, req.body || {});
        res.status(httpStatus.CREATED).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export default {
    summary,
    listEntries,
    listClosings,
    openDay,
    addFund,
    addExpense,
    closeDay,
};
