import httpStatus from 'http-status-codes';
import posService from './pos.service.js';

const checkout = async (req, res, next) => {
    try {
        const invoice = await posService.createBilling(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(invoice);
    } catch (error) {
        next(error);
    }
};

export default {
    checkout,
};
