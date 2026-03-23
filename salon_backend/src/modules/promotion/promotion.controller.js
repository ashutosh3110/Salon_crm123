import httpStatus from 'http-status-codes';
import promotionService from './promotion.service.js';
import promotionRepository from './promotion.repository.js';
import Invoice from '../invoice/invoice.model.js';

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

const validateCoupon = async (req, res, next) => {
    try {
        const { couponCode, billAmount, customerId } = req.body || {};

        const cc = String(couponCode || '').trim().toUpperCase();
        if (!cc) {
            return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'couponCode is required' });
        }

        const promo = await promotionRepository.findOne({
            tenantId: req.tenantId,
            couponCode: cc,
            isActive: true,
        });

        if (!promo || promo.activationMode !== 'COUPON') {
            return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'Invalid or expired promo code' });
        }

        const cid = customerId || (req.user?.role === 'customer' ? req.user._id : null);

        let isFirstVisit = false;
        if (cid) {
            const paidCount = await Invoice.countDocuments({
                tenantId: req.tenantId,
                clientId: cid,
                paymentStatus: 'paid',
            });
            isFirstVisit = paidCount === 0;
        }

        const validated = await promotionService.validatePromotion(req.tenantId, promo._id, billAmount, { isFirstVisit });
        const discount = await promotionService.applyDiscount(validated, billAmount);

        res.status(httpStatus.OK).send({
            success: true,
            data: {
                promotionId: String(validated._id),
                name: validated.name,
                type: validated.type,
                value: validated.value,
                couponCode: validated.couponCode,
                discount,
            },
        });
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
    validateCoupon,
};
