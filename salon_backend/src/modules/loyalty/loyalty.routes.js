import express from 'express';
import loyaltyController from './loyalty.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { loyaltyValidation } from '../../validations/index.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router.get('/wallet/:customerId', loyaltyController.getWallet);
router.get('/history/:customerId', loyaltyController.getHistory);
router.post('/rules', authorize(['admin']), validate(loyaltyValidation.setupRules), loyaltyController.setupRules);
router.post('/refer', validate(loyaltyValidation.refer), loyaltyController.referCustomer);

export default router;
