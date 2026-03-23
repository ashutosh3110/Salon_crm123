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

const getStockOverview = async (req, res, next) => {
    try {
        const data = await inventoryService.getStockOverview(req.tenantId);
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const getStockInHistory = async (req, res, next) => {
    try {
        const data = await inventoryService.listStockInHistory(req.tenantId, req.query);
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const getAdjustmentHistory = async (req, res, next) => {
    try {
        const data = await inventoryService.listAdjustmentHistory(req.tenantId, req.query);
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const getLowStockAlerts = async (req, res, next) => {
    try {
        const data = await inventoryService.getLowStockAlerts(req.tenantId);
        res.send(data);
    } catch (error) {
        next(error);
    }
};

export default {
    stockIn,
    adjustStock,
    getOutletStock,
    getStockOverview,
    getStockInHistory,
    getAdjustmentHistory,
    getLowStockAlerts,
};
