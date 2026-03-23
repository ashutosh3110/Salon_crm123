import httpStatus from 'http-status-codes';
import cashBankService from './cashBank.service.js';

const getSummary = async (req, res, next) => {
    try {
        const data = await cashBankService.getSummary(req.tenantId, req.query);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const saveReconciliation = async (req, res, next) => {
    try {
        const data = await cashBankService.saveReconciliation(req.tenantId, req.body || {});
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export default {
    getSummary,
    saveReconciliation,
};
