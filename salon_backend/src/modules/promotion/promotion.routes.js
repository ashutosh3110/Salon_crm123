import express from 'express';
import promotionController from './promotion.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { promotionValidation } from '../../validations/index.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router.post('/', authorize(['admin', 'manager']), validate(promotionValidation.createPromotion), promotionController.createPromotion);
router.get('/active', promotionController.getActivePromotions);

export default router;
