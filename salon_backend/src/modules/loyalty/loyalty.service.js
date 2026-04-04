import loyaltyRepository from './loyalty.repository.js';
import cacheService from '../../utils/cache.service.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';
import { logAudit } from '../../utils/audit.logger.js';
import ReferralSettings from './referralSettings.model.js';
import Client from '../client/client.model.js';
import notificationService from '../notification/notification.service.js';

class LoyaltyService {
    /**
     * Get loyalty rule for tenant with caching
     */
    async getLoyaltyRule(tenantId) {
        const cacheKey = cacheService.generateKey(tenantId, 'loyalty', 'rule');
        const cachedRule = await cacheService.get(cacheKey);
        if (cachedRule) return cachedRule;

        let rule = await loyaltyRepository.getRule(tenantId);

        // If no rule exists for this tenant, auto-create defaults so wallet top-ups work.
        if (!rule) {
            rule = await loyaltyRepository.RuleModel.create({
                tenantId,
                isActive: true,
            });
        }

        await cacheService.set(cacheKey, rule, 3600); // 1 hour cache
        return rule;
    }

    /**
     * Earn points flow
     */
    async earnPoints(tenantId, customerId, invoiceId, amount) {
        const rule = await this.getLoyaltyRule(tenantId);
        if (!rule || !rule.isActive) return { points: 0, expiryDate: null };

        // Fraud check: Max points cap
        // Rupees-only mode: treat amounts as rupees and convert to points 1:1.
        // Use round to avoid losing paise values silently.
        let points = Math.round(amount * rule.earnRate);
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

            // Notify Customer about earned points
            notificationService.sendNotification({
                recipientId: customerId,
                recipientType: 'client',
                tenantId: tenantId,
                type: 'points_earned',
                title: 'You Earned Points!',
                body: `Congratulations! You've earned ${points} loyalty points from your latest visit.`,
                actionUrl: '/app/wallet',
            }).catch(err => console.error('[LoyaltyNotification] Earn alert error:', err));
        } catch (error) {
            await session.abortTransaction();
            logger.error('Earn Points Error:', error);
            throw error;
        } finally {
            session.endSession();
        }

        // Check referral completion
        await this.completeReferral(tenantId, customerId);

        return { points, expiryDate };
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

        const settings = await ReferralSettings.findOne({ tenantId }).sort({ updatedAt: -1 }).lean();
        if (settings && settings.enabled === false) {
            throw new Error('Referral program is disabled');
        }
        const rewardPoints = Number(settings?.referrerReward ?? 100);

        return loyaltyRepository.ReferralModel.create({
            tenantId,
            referrerCustomerId: referrerId,
            referredCustomerId: referredId,
            rewardPoints,
        });
    }

    async createReferralByCode(tenantId, referralCode, referredId) {
        const code = String(referralCode || '').trim().toUpperCase();
        if (!code.startsWith('WAPIXO') || code.length < 8) return null;

        const phoneSuffix = code.replace('WAPIXO', '');
        const referrer = await Client.findOne({
            tenantId,
            phone: { $regex: `${phoneSuffix}$` },
            _id: { $ne: referredId },
        }).sort({ createdAt: -1 });

        if (!referrer) return null;

        const existing = await loyaltyRepository.ReferralModel.findOne({
            tenantId,
            referredCustomerId: referredId,
        });
        if (existing) return existing;

        return this.createReferral(tenantId, referrer._id, referredId);
    }

    async completeReferral(tenantId, customerId) {
        const referral = await loyaltyRepository.ReferralModel.findOne({
            tenantId,
            referredCustomerId: customerId,
            status: 'PENDING',
        });

        if (referral) {
            const settings = await ReferralSettings.findOne({ tenantId }).sort({ updatedAt: -1 }).lean();
            const referredReward = Number(settings?.referredReward ?? 0);

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

            // Notify Referrer
            notificationService.sendNotification({
                recipientId: referral.referrerCustomerId,
                recipientType: 'client',
                tenantId: tenantId,
                type: 'referral_reward',
                title: 'Referral Reward!',
                body: `You received ${referral.rewardPoints} points because your friend used your referral code!`,
                actionUrl: '/app/wallet',
            }).catch(err => console.error('[LoyaltyNotification] Referrer alert error:', err));

            // Reward referred customer as per admin setting
            if (referredReward > 0) {
                await loyaltyRepository.createTransaction({
                    tenantId,
                    customerId,
                    type: 'EARN',
                    points: referredReward,
                    metadata: { referralId: referral._id, type: 'REFERRED_REWARD' },
                });
                await loyaltyRepository.updateWallet(tenantId, customerId, referredReward);

                // Notify Referred Customer
                notificationService.sendNotification({
                    recipientId: customerId,
                    recipientType: 'client',
                    tenantId: tenantId,
                    type: 'referral_reward',
                    title: 'Welcome Reward!',
                    body: `You received ${referredReward} points as a welcome gift for joining via referral!`,
                    actionUrl: '/app/wallet',
                }).catch(err => console.error('[LoyaltyNotification] Referred customer alert error:', err));
            }
        }
    }

    async handleReferralEvent(tenantId, customerId, eventKey) {
        const settings = await ReferralSettings.findOne({ tenantId }).sort({ updatedAt: -1 }).lean();
        if (settings && settings.enabled === false) return;
        const threshold = settings?.threshold || 'FIRST_SERVICE';
        if (threshold !== eventKey) return;
        await this.completeReferral(tenantId, customerId);
    }
}

export default new LoyaltyService();
