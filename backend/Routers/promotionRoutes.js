const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth');
const {
    getPromotions,
    getActivePromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
} = require('../Controllers/promotionController');

router.get('/active', protect, getActivePromotions);

router.use(protect);
router.use(authorize('admin', 'manager'));

router.route('/').get(getPromotions).post(createPromotion);
router.route('/:id').patch(updatePromotion).delete(deletePromotion);

module.exports = router;
