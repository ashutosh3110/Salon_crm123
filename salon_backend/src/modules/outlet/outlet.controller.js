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

const getNearbyOutletsPublic = async (req, res, next) => {
    try {
        const lat = req.query.lat != null ? parseFloat(req.query.lat) : null;
        const lng = req.query.lng != null ? parseFloat(req.query.lng) : null;
        const radius = req.query.radius != null ? parseFloat(req.query.radius) : 3;
        const outlets = await outletService.getNearbyOutletsPublic(lat, lng, radius);
        res.send(outlets);
    } catch (error) {
        next(error);
    }
};

const getOutlets = async (req, res, next) => {
    try {
        const lat = req.query.lat != null ? parseFloat(req.query.lat) : null;
        const lng = req.query.lng != null ? parseFloat(req.query.lng) : null;
        const radiusKm = req.query.radius != null ? parseFloat(req.query.radius) : null;
        const options = (lat != null && lng != null && radiusKm != null) ? { lat, lng, radiusKm } : {};
        const outlets = await outletService.getOutlets(req.tenantId, options);
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
    getNearbyOutletsPublic,
};
