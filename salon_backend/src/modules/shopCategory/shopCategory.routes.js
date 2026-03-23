import express from 'express';
import shopCategoryController from './shopCategory.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { shopCategoryValidation } from '../../validations/index.js';

const router = express.Router();

// Public read for customer app (same pattern as CMS tenant read)
router.get('/tenant/:tenantId', shopCategoryController.listByTenantPublic);

router.use(auth);
router.use(validateTenant);

router
    .route('/')
    .get(authorize(['admin', 'manager', 'receptionist', 'customer']), shopCategoryController.list)
    .post(authorize(['admin', 'manager']), validate(shopCategoryValidation.create), shopCategoryController.create);

router
    .route('/:shopCategoryId')
    .patch(authorize(['admin', 'manager']), validate(shopCategoryValidation.update), shopCategoryController.update)
    .delete(authorize(['admin', 'manager']), validate(shopCategoryValidation.remove), shopCategoryController.remove);

export default router;
