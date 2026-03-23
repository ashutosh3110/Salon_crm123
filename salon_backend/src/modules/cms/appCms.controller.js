import httpStatus from 'http-status-codes';
import mongoose from 'mongoose';
import appCmsService from './appCms.service.js';

/** Public read for customer app — marketing content only, scoped by tenant */
const getAppCMSByTenant = async (req, res, next) => {
    try {
        const { tenantId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(tenantId)) {
            return res.status(httpStatus.BAD_REQUEST).send({
                success: false,
                message: 'Invalid tenant id',
                data: { banners: [], offers: [], lookbook: [], experts: [] },
            });
        }
        const data = await appCmsService.getAppCMS(tenantId);
        const experts = await appCmsService.getExpertsFromStaff(tenantId);
        res.status(httpStatus.OK).send({
            success: true,
            data: { ...data, experts },
        });
    } catch (error) {
        next(error);
    }
};

const getAppCMS = async (req, res, next) => {
    try {
        const tenantId = await appCmsService.resolveTenantId(req.user, req.query.tenantId);
        if (!tenantId) {
            return res.status(httpStatus.NOT_FOUND).send({
                success: false,
                message: 'Tenant not found for this user',
                data: { banners: [], offers: [], lookbook: [], experts: [] },
            });
        }
        const data = await appCmsService.getAppCMS(tenantId);
        const experts = await appCmsService.getExpertsFromStaff(tenantId);
        res.status(httpStatus.OK).send({
            success: true,
            data: { ...data, experts },
        });
    } catch (error) {
        next(error);
    }
};

const updateAppCMSSection = async (req, res, next) => {
    try {
        const tenantId = await appCmsService.resolveTenantId(req.user, req.query.tenantId);
        if (!tenantId) {
            return res.status(httpStatus.NOT_FOUND).send({
                success: false,
                message: 'Tenant not found for this user',
            });
        }
        const { section } = req.params;
        const content = req.body?.content ?? req.body;
        const data = await appCmsService.updateAppCMSSection(tenantId, section, content);
        res.status(httpStatus.OK).send({ success: true, data });
    } catch (error) {
        const msg = String(error?.message || '');
        if (msg.includes('BSON') || msg.includes('maximum BSON') || error?.code === 17419) {
            return res.status(httpStatus.REQUEST_TOO_LONG || 413).send({
                success: false,
                message: 'Content too large (e.g. image). Use a smaller image or compress it.',
            });
        }
        next(error);
    }
};

export default {
    getAppCMS,
    getAppCMSByTenant,
    updateAppCMSSection,
};
