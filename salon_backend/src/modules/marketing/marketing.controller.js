import httpStatus from 'http-status-codes';
import marketingService from './marketing.service.js';
import tenantService from '../tenant/tenant.service.js';

const resolveTenantId = async (req) => {
    let tid = req.user?.tenantId || null;
    if (tid) {
        try {
            await tenantService.getTenantById(tid);
        } catch {
            tid = null;
        }
    }
    if (!tid && req.user?._id) {
        const byOwner = await tenantService.queryTenants({ owner: req.user._id }, { page: 1, limit: 1 });
        tid = byOwner?.results?.[0]?._id || null;
    }
    if (!tid && req.user?.email) {
        const byEmail = await tenantService.queryTenants({ email: String(req.user.email).toLowerCase() }, { page: 1, limit: 1 });
        tid = byEmail?.results?.[0]?._id || null;
    }
    return tid;
};

const getDashboard = async (req, res, next) => {
    try {
        const tenantId = await resolveTenantId(req);
        if (!tenantId) {
            return res.status(httpStatus.NOT_FOUND).send({
                success: false,
                message: 'Tenant not found for this user',
                data: null,
            });
        }
        const data = await marketingService.getDashboardStats(tenantId);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getSegments = async (req, res, next) => {
    try {
        const tenantId = await resolveTenantId(req);
        if (!tenantId) {
            return res.status(httpStatus.NOT_FOUND).send({
                success: false,
                message: 'Tenant not found for this user',
                data: [],
            });
        }
        const data = await marketingService.getSegments(tenantId);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getCampaigns = async (req, res, next) => {
    try {
        const tenantId = await resolveTenantId(req);
        if (!tenantId) {
            return res.status(httpStatus.NOT_FOUND).send({
                success: false,
                message: 'Tenant not found for this user',
                data: { results: [] },
            });
        }
        const filter = {};
        if (req.query.channel) filter.channel = req.query.channel;
        if (req.query.status) filter.status = req.query.status;
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 50,
            sortBy: req.query.sortBy || 'createdAt:desc',
        };
        const result = await marketingService.queryCampaigns(tenantId, filter, options);
        res.status(httpStatus.OK).send({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const createCampaign = async (req, res, next) => {
    try {
        const tenantId = await resolveTenantId(req);
        if (!tenantId) {
            return res.status(httpStatus.NOT_FOUND).send({
                success: false,
                message: 'Tenant not found for this user',
            });
        }
        let targetCount = 0;
        if (req.body.type === 'bulk') {
            const segs = await marketingService.getSegments(tenantId);
            targetCount = segs.find((s) => s.id === 'all')?.count || 0;
        } else if (req.body.segment) {
            targetCount = (await marketingService.getSegmentCount(tenantId, req.body.segment)) || 0;
        }
        const campaign = await marketingService.createCampaign(
            tenantId,
            { ...req.body, targetCount },
            req.user?._id
        );
        res.status(httpStatus.CREATED).send({ success: true, data: campaign });
    } catch (error) {
        next(error);
    }
};

const getAutomations = async (req, res, next) => {
    try {
        const tenantId = await resolveTenantId(req);
        if (!tenantId) {
            return res.status(httpStatus.NOT_FOUND).send({
                success: false,
                message: 'Tenant not found for this user',
                data: [],
            });
        }
        const data = await marketingService.getAutomations(tenantId);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const updateAutomation = async (req, res, next) => {
    try {
        const tenantId = await resolveTenantId(req);
        if (!tenantId) {
            return res.status(httpStatus.NOT_FOUND).send({
                success: false,
                message: 'Tenant not found for this user',
            });
        }
        const { flowId } = req.params;
        const data = await marketingService.updateAutomation(tenantId, flowId, req.body);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export default {
    getDashboard,
    getSegments,
    getCampaigns,
    createCampaign,
    getAutomations,
    updateAutomation,
};
