import httpStatus from 'http-status-codes';
import clientService from './client.service.js';

const createClient = async (req, res, next) => {
    try {
        const client = await clientService.createClient(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(client);
    } catch (error) {
        next(error);
    }
};

const getClients = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
        };
        const result = await clientService.queryClients(req.tenantId, filter, options);
        res.send(result);
    } catch (error) {
        next(error);
    }
};

const getClient = async (req, res, next) => {
    try {
        const client = await clientService.getClientById(req.tenantId, req.params.clientId);
        res.send(client);
    } catch (error) {
        next(error);
    }
};

export default {
    createClient,
    getClients,
    getClient,
};
