import httpStatus from 'http-status-codes';
import outletService from './outlet.service.js';

const createOutlet = async (req, res, next) => {
    try {
        const outlet = await outletService.createOutlet({
            ...req.body,
            tenantId: req.tenantId
        });
        res.status(httpStatus.CREATED).send(outlet);
    } catch (error) {
        next(error);
    }
};

const getOutlets = async (req, res, next) => {
    try {
        const outlets = await outletService.getOutlets(req.tenantId);
        res.send(outlets);
    } catch (error) {
        next(error);
    }
};

const getOutlet = async (req, res, next) => {
    try {
        const outlet = await outletService.getOutletById(req.params.outletId, req.tenantId);
        if (!outlet) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'Outlet not found' });
        }
        res.send(outlet);
    } catch (error) {
        next(error);
    }
};

const updateOutlet = async (req, res, next) => {
    try {
        const outlet = await outletService.updateOutletById(req.params.outletId, req.tenantId, req.body);
        res.send(outlet);
    } catch (error) {
        next(error);
    }
};

const deleteOutlet = async (req, res, next) => {
    try {
        await outletService.deleteOutletById(req.params.outletId, req.tenantId);
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

export default {
    createOutlet,
    getOutlets,
    getOutlet,
    updateOutlet,
    deleteOutlet,
};
