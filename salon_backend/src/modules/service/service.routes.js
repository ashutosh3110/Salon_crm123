import express from 'express';
import serviceController from './service.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { serviceValidation } from '../../validations/index.js';
import checkSubscriptionLimit from '../../middlewares/subscription.js';
import upload from '../../middlewares/upload.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router
    .route('/bulk-import')
    .post(authorize(['admin', 'manager']), upload.single('file'), serviceController.bulkImport);

router
    .route('/')
    .post(checkSubscriptionLimit('services'), validate(serviceValidation.createService), serviceController.createService)
    .get(authorize(['admin', 'manager', 'receptionist', 'customer']), validate(serviceValidation.getServices), serviceController.getServices);

// Category Routes
router
    .route('/categories')
    .get(serviceController.getCategories)
    .post(authorize(['admin', 'manager']), validate(serviceValidation.createCategory), serviceController.createCategory);

router
    .route('/categories/:categoryId')
    .patch(authorize(['admin', 'manager']), validate(serviceValidation.updateCategory), serviceController.updateCategory)
    .delete(authorize(['admin', 'manager']), validate(serviceValidation.deleteCategory), serviceController.deleteCategory);

router
    .route('/:serviceId')
    .get(validate(serviceValidation.getService), serviceController.getService)
    .patch(authorize(['admin', 'manager']), validate(serviceValidation.updateService), serviceController.updateService)
    .delete(authorize(['admin', 'manager']), validate(serviceValidation.deleteService), serviceController.deleteService);

export default router;
