import express from 'express';
import tenantController from './tenant.controller.js';
import auth from '../../middlewares/auth.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { tenantValidation } from '../../validations/index.js';

const router = express.Router();

router.get('/public-list', tenantController.getPublicTenants);

router.get('/stats', auth, authorize(['superadmin']), tenantController.getTenantStats);

router
    .route('/')
    .post(auth, authorize(['superadmin']), validate(tenantValidation.createTenant), tenantController.createTenant)
    .get(auth, authorize(['superadmin']), tenantController.getTenants);

router
    .route('/:tenantId')
    .get(auth, authorize(['superadmin', 'admin']), tenantController.getTenant)
    .put(auth, authorize(['superadmin']), tenantController.updateTenant)
    .delete(auth, authorize(['superadmin']), tenantController.deleteTenant);

export default router;
