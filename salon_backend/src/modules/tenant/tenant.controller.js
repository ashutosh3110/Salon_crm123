import httpStatus from 'http-status-codes';
import tenantService from './tenant.service.js';

const createTenant = async (req, res, next) => {
    try {
        const tenant = await tenantService.createTenant(req.body);
        res.status(httpStatus.CREATED).send(tenant);
    } catch (error) {
        next(error);
    }
};

const getTenants = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.subscriptionPlan) filter.subscriptionPlan = req.query.subscriptionPlan;
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
        };
        const result = await tenantService.queryTenants(filter, options);
        res.send(result);
    } catch (error) {
        next(error);
    }
};

const getTenant = async (req, res, next) => {
    try {
        const tenant = await tenantService.getTenantById(req.params.tenantId);
        res.send(tenant);
    } catch (error) {
        next(error);
    }
};

const updateTenant = async (req, res, next) => {
    try {
        const tenant = await tenantService.updateTenantById(req.params.tenantId, req.body);
        res.send(tenant);
    } catch (error) {
        next(error);
    }
};

const deleteTenant = async (req, res, next) => {
    try {
        const tenant = await tenantService.deleteTenantById(req.params.tenantId);
        res.send(tenant);
    } catch (error) {
        next(error);
    }
};

const getTenantStats = async (req, res, next) => {
    try {
        const stats = await tenantService.getTenantStats();
        res.send(stats);
    } catch (error) {
        next(error);
    }
};

const getPublicTenants = async (req, res, next) => {
    try {
        const result = await tenantService.queryTenants({ status: 'active' }, { limit: 100 });
        const salons = result.results.map(t => ({ id: t._id, name: t.name }));
        res.send(salons);
    } catch (error) {
        next(error);
    }
};

export default {
    createTenant,
    getTenants,
    getTenant,
    updateTenant,
    deleteTenant,
    getTenantStats,
    getPublicTenants,
};
