import httpStatus from 'http-status-codes';
import tenantService from './tenant.service.js';

const createTenant = async (req, res, next) => {
    try {
        const tenant = await tenantService.createTenant(req.body);
        res.status(httpStatus.CREATED).send({
            success: true,
            message: 'Salon created successfully',
            data: tenant
        });
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
            const searchRegex = { $regex: req.query.search, $options: 'i' };
            filter.$or = [
                { name: searchRegex },
                { ownerName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { city: searchRegex }
            ];
        }
        
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
            if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
        }

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
        };
        const result = await tenantService.queryTenants(filter, options);
        res.send({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getTenant = async (req, res, next) => {
    try {
        const tenant = await tenantService.getTenantById(req.params.tenantId);
        res.send({
            success: true,
            data: tenant
        });
    } catch (error) {
        next(error);
    }
};

const updateTenant = async (req, res, next) => {
    try {
        const tenant = await tenantService.updateTenantById(req.params.tenantId, req.body);
        res.send({
            success: true,
            message: 'Salon updated successfully',
            data: tenant
        });
    } catch (error) {
        next(error);
    }
};

const deleteTenant = async (req, res, next) => {
    try {
        const tenant = await tenantService.deleteTenantById(req.params.tenantId);
        res.send({
            success: true,
            message: 'Salon deleted successfully',
            data: tenant
        });
    } catch (error) {
        next(error);
    }
};

const getTenantStats = async (req, res, next) => {
    try {
        const stats = await tenantService.getTenantStats();
        res.send({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

const getPublicTenants = async (req, res, next) => {
    try {
        const result = await tenantService.queryTenants({ status: 'active' }, { limit: 100 });
        const salons = result.results.map(t => ({ id: t._id, name: t.name }));
        res.send({
            success: true,
            data: salons
        });
    } catch (error) {
        next(error);
    }
};

const getTenantMe = async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId || req.user._id; // Supporting both staff (tenantId) and owner (_id if schema varies)
        const tenant = await tenantService.getTenantById(tenantId);
        res.send({
            success: true,
            data: tenant
        });
    } catch (error) {
        next(error);
    }
};

const updateTenantMe = async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId || req.user._id;
        const tenant = await tenantService.updateTenantById(tenantId, req.body);
        res.send({
            success: true,
            message: 'Settings updated successfully',
            data: tenant
        });
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
    getTenantMe,
    updateTenantMe,
};
