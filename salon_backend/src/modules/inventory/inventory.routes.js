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

router.post('/stock-in', authorize(['admin', 'manager']), validate(inventoryValidation.stockIn), inventoryController.stockIn);
router.post('/adjust', authorize(['admin', 'manager']), validate(inventoryValidation.adjustStock), inventoryController.adjustStock);
router.get('/outlet/:outletId', authorize(['admin', 'manager']), inventoryController.getOutletStock);

export default router;
