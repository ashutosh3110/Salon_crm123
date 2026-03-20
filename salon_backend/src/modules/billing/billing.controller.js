import httpStatus from 'http-status-codes';
import billingService from './billing.service.js';
import tenantService from '../tenant/tenant.service.js';

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

const getMyTransactions = async (req, res, next) => {
    try {
        let resolvedTenantId = req.user?.tenantId || null;

        if (resolvedTenantId) {
            try {
                await tenantService.getTenantById(resolvedTenantId);
            } catch (error) {
                resolvedTenantId = null;
            }
        }

        if (!resolvedTenantId && req.user?._id) {
            const byOwner = await tenantService.queryTenants({ owner: req.user._id }, { page: 1, limit: 1 });
            resolvedTenantId = byOwner?.results?.[0]?._id || null;
        }

        if (!resolvedTenantId && req.user?.email) {
            const byEmail = await tenantService.queryTenants({ email: String(req.user.email).toLowerCase() }, { page: 1, limit: 1 });
            resolvedTenantId = byEmail?.results?.[0]?._id || null;
        }

        if (!resolvedTenantId) {
            return res.status(httpStatus.NOT_FOUND).send({
                code: httpStatus.NOT_FOUND,
                message: 'Tenant not found for this user',
                data: { results: [] }
            });
        }

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            sortBy: req.query.sortBy || 'createdAt:desc',
        };

        const result = await billingService.queryMyTransactions(resolvedTenantId, options);
        res.status(httpStatus.OK).send({
            code: httpStatus.OK,
            message: 'My transactions retrieved',
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
    getMyTransactions,
    createManualInvoice
};
