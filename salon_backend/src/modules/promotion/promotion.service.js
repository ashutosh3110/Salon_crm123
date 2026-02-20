import promotionRepository from './promotion.repository.js';
import cacheService from '../../utils/cache.service.js';

class PromotionService {
    async createPromotion(tenantId, promotionData) {
        const promotion = await promotionRepository.create({ ...promotionData, tenantId });
        await cacheService.del(cacheService.generateKey(tenantId, 'promotions', 'active'));
        return promotion;
    }

    async getActivePromotions(tenantId) {
        const cacheKey = cacheService.generateKey(tenantId, 'promotions', 'active');
        const cached = await cacheService.get(cacheKey);
        if (cached) return cached;

        const promos = await promotionRepository.findActivePromotions(tenantId);
        await cacheService.set(cacheKey, promos, 1800); // 30 min cache
        return promos;
    }

    async validatePromotion(tenantId, promoId, billAmount) {
        const promotion = await promotionRepository.findOne({ _id: promoId, tenantId, isActive: true });
        if (!promotion) throw new Error('Promotion not found or inactive');

        if (billAmount < promotion.minBillAmount) {
            throw new Error(`Minimum bill amount ${promotion.minBillAmount} required`);
        }

        const now = new Date();
        if (now < promotion.startDate || now > promotion.endDate) {
            throw new Error('Promotion expired');
        }

        return promotion;
    }

    async applyDiscount(promotion, billAmount) {
        if (promotion.type === 'FLAT') {
            return promotion.value;
        } else if (promotion.type === 'PERCENTAGE') {
            return (billAmount * promotion.value) / 100;
        }
        return 0;
    }
}

export default new PromotionService();
