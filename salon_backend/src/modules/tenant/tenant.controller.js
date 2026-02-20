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
        const filter = {}; // Super admin filter logic here
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

const getPublicTenants = async (req, res, next) => {
    try {
        const result = await tenantService.queryTenants({ status: 'active' }, { limit: 100 });
        // Only sending necessary info for public discovery
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
    getPublicTenants,
};
