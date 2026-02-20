import httpStatus from 'http-status-codes';
import promotionService from './promotion.service.js';

const createPromotion = async (req, res, next) => {
    try {
        const promotion = await promotionService.createPromotion(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(promotion);
    } catch (error) {
        next(error);
    }
};

const getActivePromotions = async (req, res, next) => {
    try {
        const promotions = await promotionService.getActivePromotions(req.tenantId);
        res.send(promotions);
    } catch (error) {
        next(error);
    }
};

export default {
    createPromotion,
    getActivePromotions,
};
