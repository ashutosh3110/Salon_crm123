import express from 'express';
import serviceController from './service.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import validate from '../../middlewares/validate.js';
import { serviceValidation } from '../../validations/index.js';
import checkSubscriptionLimit from '../../middlewares/subscription.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router
    .route('/')
    .post(checkSubscriptionLimit('services'), validate(serviceValidation.createService), serviceController.createService)
    .get(validate(serviceValidation.getServices), serviceController.getServices);

router
    .route('/:serviceId')
    .get(serviceController.getService);

export default router;
