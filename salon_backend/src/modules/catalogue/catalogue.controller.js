import httpStatus from 'http-status-codes';
import catalogueService from './catalogue.service.js';

const createOrUpdateCatalogue = async (req, res, next) => {
    try {
        const catalogue = await catalogueService.createOrUpdateCatalogue(req.tenantId, req.body);
        res.status(httpStatus.OK).send(catalogue);
    } catch (error) {
        next(error);
    }
};

const getMyCatalogue = async (req, res, next) => {
    try {
        const catalogue = await catalogueService.getCatalogueByTenantId(req.tenantId);
        res.send(catalogue);
    } catch (error) {
        next(error);
    }
};

const getPublicCatalogue = async (req, res, next) => {
    try {
        const catalogue = await catalogueService.getPublicCatalogueBySlug(req.params.slug);
        res.send(catalogue);
    } catch (error) {
        next(error);
    }
};

const togglePublish = async (req, res, next) => {
    try {
        const { isPublished } = req.body;
        const catalogue = await catalogueService.togglePublishStatus(req.tenantId, isPublished);
        res.send(catalogue);
    } catch (error) {
        next(error);
    }
};

export default {
    createOrUpdateCatalogue,
    getMyCatalogue,
    getPublicCatalogue,
    togglePublish,
};
