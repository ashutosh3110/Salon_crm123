import express from 'express';
import inventoryController from './inventory.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { inventoryValidation } from '../../validations/index.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router.get(
    '/stock-in/history',
    authorize(['admin', 'manager', 'receptionist', 'inventory_manager']),
    validate(inventoryValidation.stockInHistoryQuery),
    inventoryController.getStockInHistory
);
router.post('/stock-in', authorize(['admin', 'manager']), validate(inventoryValidation.stockIn), inventoryController.stockIn);
router.get(
    '/adjust/history',
    authorize(['admin', 'manager', 'receptionist', 'inventory_manager']),
    validate(inventoryValidation.adjustHistoryQuery),
    inventoryController.getAdjustmentHistory
);
router.post('/adjust', authorize(['admin', 'manager']), validate(inventoryValidation.adjustStock), inventoryController.adjustStock);
router.get(
    '/overview',
    authorize(['admin', 'manager', 'receptionist', 'inventory_manager', 'stylist', 'customer']),
    inventoryController.getStockOverview
);
router.get(
    '/low-stock',
    authorize(['admin', 'manager', 'receptionist', 'inventory_manager']),
    inventoryController.getLowStockAlerts
);
router.get('/outlet/:outletId', authorize(['admin', 'manager', 'receptionist', 'inventory_manager', 'stylist', 'customer']), inventoryController.getOutletStock);

export default router;
