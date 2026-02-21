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

router.get('/analytics', authorize(['admin', 'manager']), promotionController.getOfferAnalytics);
router.post('/', authorize(['admin', 'manager']), validate(promotionValidation.createPromotion), promotionController.createPromotion);
router.get('/', authorize(['admin', 'manager', 'customer']), promotionController.getPromotions);
router.get('/active', authorize(['admin', 'manager', 'customer']), promotionController.getActivePromotions);
router.get('/:promotionId', authorize(['admin', 'manager']), promotionController.getPromotion);
router.patch('/:promotionId', authorize(['admin', 'manager']), validate(promotionValidation.updatePromotion), promotionController.updatePromotion);
router.delete('/:promotionId', authorize(['admin', 'manager']), promotionController.deletePromotion);

export default router;
