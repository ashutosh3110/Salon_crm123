import httpStatus from 'http-status-codes';
import invoiceService from './invoice.service.js';

const getInvoices = async (req, res, next) => {
    try {
        const filters = {
            date: req.query.date,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            outletId: req.query.outletId,
            paymentMethod: req.query.paymentMethod,
            paymentStatus: req.query.paymentStatus,
            page: req.query.page,
            limit: req.query.limit,
        };
        const result = await invoiceService.queryInvoices(req.tenantId, filters);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        next(error);
    }
};

const getInvoice = async (req, res, next) => {
    try {
        const invoice = await invoiceService.getInvoiceById(req.tenantId, req.params.invoiceId);
        res.status(httpStatus.OK).send(invoice);
    } catch (error) {
        next(error);
    }
};

const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await invoiceService.getDashboardStats(req.tenantId);
        res.status(httpStatus.OK).send(stats);
    } catch (error) {
        next(error);
    }
};

export default {
    getInvoices,
    getInvoice,
    getDashboardStats,
};
