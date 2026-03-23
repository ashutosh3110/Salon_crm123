import httpStatus from 'http-status-codes';
import financeService from './finance.service.js';

const listExpenses = async (req, res, next) => {
    try {
        const data = await financeService.listExpenses(req.tenantId, req.query);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const createExpense = async (req, res, next) => {
    try {
        const created = await financeService.createExpense(req.tenantId, req.body || {});
        res.status(httpStatus.CREATED).send({ success: true, data: created });
    } catch (error) {
        next(error);
    }
};

export default {
    listExpenses,
    createExpense,
};
