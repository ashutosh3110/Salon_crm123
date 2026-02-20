import express from 'express';
import posController from './pos.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import validate from '../../middlewares/validate.js';
import { posValidation } from '../../validations/index.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router.post('/checkout', validate(posValidation.checkout), posController.checkout);

export default router;
