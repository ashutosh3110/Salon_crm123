const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth');
const {
    getPromotions,
    getActivePromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    validateCoupon,
    sharePromotionWhatsApp,
} = require('../Controllers/promotionController');

router.get('/active', protect, getActivePromotions);
router.post('/validate-coupon', protect, validateCoupon);

router.use(protect);
router.use(authorize('admin', 'manager'));

router.route('/').get(getPromotions).post(createPromotion);
router.route('/:id').patch(updatePromotion).delete(deletePromotion);
router.post('/:id/share-whatsapp', sharePromotionWhatsApp);

module.exports = router;
