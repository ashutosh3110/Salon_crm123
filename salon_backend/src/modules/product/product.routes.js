import express from 'express';
import productController from './product.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { productValidation } from '../../validations/index.js';
import checkSubscriptionLimit from '../../middlewares/subscription.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router
    .route('/')
    .post(checkSubscriptionLimit('products'), validate(productValidation.createProduct), productController.createProduct)
    .get(authorize(['admin', 'manager', 'receptionist', 'customer']), validate(productValidation.getProducts), productController.getProducts);

router
    .route('/:productId')
    .get(authorize(['admin', 'manager', 'receptionist', 'customer']), productController.getProduct);

export default router;
