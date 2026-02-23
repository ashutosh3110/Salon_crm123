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

const getOfferAnalytics = async (req, res, next) => {
    try {
        const analytics = await promotionService.getOfferAnalytics(req.tenantId);
        res.send(analytics);
    } catch (error) {
        next(error);
    }
};

const getPromotions = async (req, res, next) => {
    try {
        const promotions = await promotionService.getPromotions(req.tenantId, req.query);
        res.send(promotions);
    } catch (error) {
        next(error);
    }
};

const getPromotion = async (req, res, next) => {
    try {
        const promotion = await promotionService.getPromotion(req.tenantId, req.params.promotionId);
        res.send(promotion);
    } catch (error) {
        next(error);
    }
};

const updatePromotion = async (req, res, next) => {
    try {
        const promotion = await promotionService.updatePromotion(req.tenantId, req.params.promotionId, req.body);
        res.send(promotion);
    } catch (error) {
        next(error);
    }
};

const deletePromotion = async (req, res, next) => {
    try {
        await promotionService.deletePromotion(req.tenantId, req.params.promotionId);
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

export default {
    createPromotion,
    getPromotions,
    getPromotion,
    updatePromotion,
    deletePromotion,
    getActivePromotions,
    getOfferAnalytics,
};
