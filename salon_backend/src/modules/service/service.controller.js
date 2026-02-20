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

export default {
    createService,
    getServices,
    getService,
};
