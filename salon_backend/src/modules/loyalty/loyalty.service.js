import loyaltyRepository from './loyalty.repository.js';
import cacheService from '../../utils/cache.service.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';
import { logAudit } from '../../utils/audit.logger.js';

class LoyaltyService {
    /**
     * Get loyalty rule for tenant with caching
     */
    async getLoyaltyRule(tenantId) {
        const cacheKey = cacheService.generateKey(tenantId, 'loyalty', 'rule');
        const cachedRule = await cacheService.get(cacheKey);
        if (cachedRule) return cachedRule;

        const rule = await loyaltyRepository.getRule(tenantId);
        if (rule) {
            await cacheService.set(cacheKey, rule, 3600); // 1 hour cache
        }
        return rule;
    }

    /**
     * Earn points flow
     */
    async earnPoints(tenantId, customerId, invoiceId, amount) {
        const rule = await this.getLoyaltyRule(tenantId);
        if (!rule || !rule.isActive) return;

        // Fraud check: Max points cap
        let points = Math.floor(amount * rule.earnRate);
        if (points > rule.maxEarnPerInvoice) {
            points = rule.maxEarnPerInvoice;
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + rule.expiryDays);

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            await loyaltyRepository.createTransaction({
                tenantId,
                customerId,
                type: 'EARN',
                points,
                invoiceId,
                expiryDate,
            });

            await loyaltyRepository.updateWallet(tenantId, customerId, points);

            await logAudit({
                tenantId,
                action: 'EARN_POINTS',
                module: 'LOYALTY',
                targetId: customerId,
                details: { points, invoiceId },
            });

            await session.commitTransaction();
            logger.info(`Customer ${customerId} earned ${points} points for invoice ${invoiceId}`);
        } catch (error) {
            await session.abortTransaction();
            logger.error('Earn Points Error:', error);
            throw error;
        } finally {
            session.endSession();
        }

        // Check referral completion
        await this.completeReferral(tenantId, customerId);
    }

    /**
     * Redeem points flow
     */
    async redeemPoints(tenantId, customerId, pointsToRedeem, invoiceId) {
        const rule = await this.getLoyaltyRule(tenantId);
        if (!rule || !rule.isActive) throw new Error('Loyalty program inactive');

        if (pointsToRedeem < rule.minRedeemPoints) {
            throw new Error(`Minimum ${rule.minRedeemPoints} points required to redeem`);
        }

        const wallet = await loyaltyRepository.getWallet(tenantId, customerId);
        if (!wallet || wallet.totalPoints < pointsToRedeem) {
            throw new Error('Insufficient points balance');
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            await loyaltyRepository.createTransaction({
                tenantId,
                customerId,
                type: 'REDEEM',
                points: -pointsToRedeem,
                invoiceId,
            });

            await loyaltyRepository.updateWallet(tenantId, customerId, -pointsToRedeem);

            await logAudit({
                tenantId,
                action: 'REDEEM_POINTS',
                module: 'LOYALTY',
                targetId: customerId,
                details: { points: pointsToRedeem, invoiceId },
            });

            await session.commitTransaction();
            return pointsToRedeem * rule.redeemRate; // Discount amount
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Reverse points (on refund)
     */
    async reversePoints(tenantId, invoiceId) {
        const transactions = await loyaltyRepository.getTransactionsByInvoice(tenantId, invoiceId);

        for (const trx of transactions) {
            if (trx.type === 'REVERSE') continue;

            const reversePoints = -trx.points;

            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                await loyaltyRepository.createTransaction({
                    tenantId,
                    customerId: trx.customerId,
                    type: 'REVERSE',
                    points: reversePoints,
                    invoiceId,
                    referenceId: trx._id,
                });

                await loyaltyRepository.updateWallet(tenantId, trx.customerId, reversePoints);
                await session.commitTransaction();
            } catch (error) {
                await session.abortTransaction();
                logger.error('Reverse Points Error:', error);
            } finally {
                session.endSession();
            }
        }
    }

    /**
     * Referral logic
     */
    async createReferral(tenantId, referrerId, referredId) {
        if (referrerId.toString() === referredId.toString()) {
            throw new Error('Self-referral is not allowed');
        }

        const rule = await this.getLoyaltyRule(tenantId);
        const rewardPoints = 100; // Can be dynamic from rule

        return loyaltyRepository.ReferralModel.create({
            tenantId,
            referrerCustomerId: referrerId,
            referredCustomerId: referredId,
            rewardPoints,
        });
    }

    async completeReferral(tenantId, customerId) {
        const referral = await loyaltyRepository.ReferralModel.findOne({
            tenantId,
            referredCustomerId: customerId,
            status: 'PENDING',
        });

        if (referral) {
            referral.status = 'COMPLETED';
            referral.rewardedAt = new Date();
            await referral.save();

            // Reward the referrer
            await loyaltyRepository.createTransaction({
                tenantId,
                customerId: referral.referrerCustomerId,
                type: 'EARN',
                points: referral.rewardPoints,
                metadata: { referralId: referral._id, type: 'REFERRAL_REWARD' }
            });
            await loyaltyRepository.updateWallet(tenantId, referral.referrerCustomerId, referral.rewardPoints);
        }
    }
}

export default new LoyaltyService();
