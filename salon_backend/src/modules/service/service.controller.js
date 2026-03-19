import httpStatus from 'http-status-codes';
import serviceService from './service.service.js';

const createService = async (req, res, next) => {
    try {
        const service = await serviceService.createService(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(service);
    } catch (error) {
        next(error);
    }
};

const getServices = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
        };
        const result = await serviceService.queryServices(req.tenantId, filter, options);
        res.send(result);
    } catch (error) {
        next(error);
    }
};

const getService = async (req, res, next) => {
    try {
        const service = await serviceService.getServiceById(req.tenantId, req.params.serviceId);
        res.send(service);
    } catch (error) {
        next(error);
    }
};

const updateService = async (req, res, next) => {
    try {
        const service = await serviceService.updateServiceById(req.tenantId, req.params.serviceId, req.body);
        res.send(service);
    } catch (error) {
        next(error);
    }
};

const deleteService = async (req, res, next) => {
    try {
        await serviceService.deleteServiceById(req.tenantId, req.params.serviceId);
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

// Category Controllers
const getCategories = async (req, res, next) => {
    try {
        const categories = await serviceService.queryCategories(req.tenantId);
        res.send(categories);
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const category = await serviceService.createCategory(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(category);
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const category = await serviceService.updateCategoryById(req.tenantId, req.params.categoryId, req.body);
        res.send(category);
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        await serviceService.deleteCategoryById(req.tenantId, req.params.categoryId);
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

export default {
    createService,
    getServices,
    getService,
    updateService,
    deleteService,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
