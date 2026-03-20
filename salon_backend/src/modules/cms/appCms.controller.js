import httpStatus from 'http-status-codes';
import appCmsService from './appCms.service.js';

const getAppCMS = async (req, res, next) => {
    try {
        const tenantId = await appCmsService.resolveTenantId(req.user);
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
        const tenantId = await appCmsService.resolveTenantId(req.user);
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
        next(error);
    }
};

export default {
    getAppCMS,
    updateAppCMSSection,
};
