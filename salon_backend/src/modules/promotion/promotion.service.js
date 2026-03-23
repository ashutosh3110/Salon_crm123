import mongoose from 'mongoose';
import promotionRepository from './promotion.repository.js';
import cacheService from '../../utils/cache.service.js';

class PromotionService {
    async createPromotion(tenantId, promotionData) {
        const normalized = { ...promotionData };
        if (normalized.couponCode) {
            normalized.couponCode = String(normalized.couponCode).toUpperCase();
        }
        const promotion = await promotionRepository.create({ ...normalized, tenantId });
        await cacheService.del(cacheService.generateKey(tenantId, 'promotions', 'active'));
        return promotion;
    }

    async getActivePromotions(tenantId) {
        const cacheKey = cacheService.generateKey(tenantId, 'promotions', 'active');
        const cached = await cacheService.get(cacheKey);
        if (cached) return cached;

        // Fetch by tenant + isActive first, then apply robust date-window filtering in JS.
        // This avoids timezone edge cases from direct DB date comparisons.
        const rows = await promotionRepository.find({ tenantId, isActive: true });
        const source = Array.isArray(rows?.results) ? rows.results : (Array.isArray(rows) ? rows : []);
        const now = new Date();
        const promos = source.filter((p) => {
            if (!p?.startDate || !p?.endDate) return true;
            const start = new Date(p.startDate);
            const end = new Date(p.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return now >= start && now <= end;
        });

        await cacheService.set(cacheKey, promos, 1800); // 30 min cache
        return promos;
    }

    async validatePromotion(tenantId, promoId, billAmount, customerData = {}) {
        const promotion = await promotionRepository.findOne({ _id: promoId, tenantId, isActive: true });
        if (!promotion) throw new Error('Promotion not found or inactive');

        // Date Validation
        const now = new Date();
        const start = new Date(promotion.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(promotion.endDate);
        // Include the full end date day (common issue when endDate is stored as "YYYY-MM-DD" -> midnight)
        end.setHours(23, 59, 59, 999);

        if (now < start || now > end) {
            throw new Error('Promotion is not within the valid date range');
        }

        // Usage Limit Validation
        if (promotion.totalUsageLimit && promotion.usedCount >= promotion.totalUsageLimit) {
            throw new Error('Offer total usage limit reached');
        }

        // Time Restriction Validation
        if (promotion.startTime && promotion.endTime) {
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [startH, startM] = promotion.startTime.split(':').map(Number);
            const [endH, endM] = promotion.endTime.split(':').map(Number);
            const startTotal = startH * 60 + startM;
            const endTotal = endH * 60 + endM;

            if (currentTime < startTotal || currentTime > endTotal) {
                throw new Error(`This offer is only valid between ${promotion.startTime} and ${promotion.endTime}`);
            }
        }

        // Bill Amount Validation
        if (billAmount < promotion.minBillAmount) {
            throw new Error(`Minimum bill amount ₹${promotion.minBillAmount} required for this offer`);
        }

        // Targeting Validation
        if (promotion.targetingType === 'NEW' && !customerData.isFirstVisit) {
            throw new Error('This offer is valid for new customers only');
        }

        // Per-customer usage check (To be integrated with Customer History)
        // if (promotion.usageLimitPerCustomer && customerData.usageCount >= promotion.usageLimitPerCustomer) {
        //     throw new Error('You have already reached the usage limit for this offer');
        // }

        return promotion;
    }

    async applyDiscount(promotion, billAmount) {
        let discount = 0;
        if (promotion.type === 'FLAT') {
            discount = promotion.value;
        } else if (promotion.type === 'PERCENTAGE') {
            discount = (billAmount * promotion.value) / 100;
        }

        // Apply Max Discount Cap
        if (promotion.maxDiscountAmount > 0 && discount > promotion.maxDiscountAmount) {
            discount = promotion.maxDiscountAmount;
        }

        return Math.min(discount, billAmount); // Cannot discount more than the bill itself
    }

    async getPromotions(tenantId, query) {
        return promotionRepository.find({ ...query, tenantId });
    }

    async getPromotion(tenantId, promotionId) {
        const promotion = await promotionRepository.findOne({ _id: promotionId, tenantId });
        if (!promotion) throw new Error('Promotion not found');
        return promotion;
    }

    async updatePromotion(tenantId, promotionId, updateBody) {
        const promotion = await this.getPromotion(tenantId, promotionId);
        Object.assign(promotion, updateBody);
        await promotion.save();
        await cacheService.del(cacheService.generateKey(tenantId, 'promotions', 'active'));
        return promotion;
    }

    async deletePromotion(tenantId, promotionId) {
        await this.getPromotion(tenantId, promotionId); // Verify existence
        await promotionRepository.deleteOne({ _id: promotionId, tenantId });
        await cacheService.del(cacheService.generateKey(tenantId, 'promotions', 'active'));
    }

    async getOfferAnalytics(tenantId) {
        const Invoice = mongoose.model('Invoice');

        // 1. Total Redemptions
        const promotions = await promotionRepository.find({ tenantId });
        const totalRedemptions = (promotions.results || []).reduce((acc, p) => acc + (p.usedCount || 0), 0);

        // 2. Top Performing Offer
        const topOffer = await promotionRepository.model.findOne({ tenantId })
            .sort({ usedCount: -1 })
            .select('name usedCount');

        // 3. Revenue Generated (Sum of discounts applied in Invoices)
        const revenueData = await Invoice.aggregate([
            { $match: { tenantId: new mongoose.Types.ObjectId(tenantId), promotionId: { $exists: true } } },
            { $group: { _id: null, totalRevenue: { $sum: '$discount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // 4. Conversion Rate (Placeholder: UsedCount / Total Invoices)
        const totalInvoices = await Invoice.countDocuments({ tenantId });
        const conversionRate = totalInvoices > 0 ? (totalRedemptions / totalInvoices) * 100 : 0;

        return {
            totalRedemptions,
            topOffer: topOffer ? { name: topOffer.name, count: topOffer.usedCount } : null,
            revenueGenerated: totalRevenue,
            conversionRate: conversionRate.toFixed(2) + '%'
        };
    }
}

export default new PromotionService();
