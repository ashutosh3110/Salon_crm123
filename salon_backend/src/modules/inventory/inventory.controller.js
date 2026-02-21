import httpStatus from 'http-status-codes';
import inventoryService from './inventory.service.js';

const stockIn = async (req, res, next) => {
    try {
        const inventory = await inventoryService.stockIn(req.tenantId, {
            ...req.body,
            performedBy: req.user._id
        });
        res.status(httpStatus.CREATED).send(inventory);
    } catch (error) {
        next(error);
    }
};

const adjustStock = async (req, res, next) => {
    try {
        const inventory = await inventoryService.adjustStock(req.tenantId, {
            ...req.body,
            performedBy: req.user._id
        });
        res.send(inventory);
    } catch (error) {
        next(error);
    }
};

const getOutletStock = async (req, res, next) => {
    try {
        const stock = await inventoryService.getOutletStock(req.tenantId, req.params.outletId);
        res.send(stock);
    } catch (error) {
        next(error);
    }
};

export default {
    stockIn,
    adjustStock,
    getOutletStock,
};
