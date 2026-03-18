import httpStatus from 'http-status-codes';
import billingService from './billing.service.js';

const getStats = async (req, res, next) => {
    try {
        const stats = await billingService.getBillingStats();
        res.status(httpStatus.OK).send({
            code: httpStatus.OK,
            message: 'Billing stats retrieved',
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

const getTransactions = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.tenantId) filter.tenantId = req.query.tenantId;

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            sortBy: req.query.sortBy || 'createdAt:desc',
            populate: req.query.populate || 'tenantId'
        };

        const result = await billingService.queryTransactions(filter, options);
        res.status(httpStatus.OK).send({
            code: httpStatus.OK,
            message: 'Transactions retrieved',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createManualInvoice = async (req, res, next) => {
    try {
        const invoice = await billingService.createManualInvoice(req.body);
        res.status(httpStatus.CREATED).send({
            code: httpStatus.CREATED,
            message: 'Manual invoice created',
            data: invoice
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getStats,
    getTransactions,
    createManualInvoice
};
