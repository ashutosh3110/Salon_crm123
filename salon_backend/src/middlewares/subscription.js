import httpStatus from 'http-status-codes';
import { getPlanLimits } from '../config/plans.js';
import { getCurrentUsage, getTenantPlan } from '../utils/subscription.util.js';
import cacheService from '../utils/cache.service.js';

/**
 * Global Subscription Limit Middleware
 * @param {string} feature - The feature to check (e.g., 'staff', 'products')
 */
const checkSubscriptionLimit = (feature) => async (req, res, next) => {
    try {
        const { tenantId } = req;

        // 1. Get Tenant Plan (Cached for performance)
        const cacheKey = `plan:${tenantId}`;
        let planName = await cacheService.get(cacheKey);

        if (!planName) {
            planName = await getTenantPlan(tenantId);
            await cacheService.set(cacheKey, planName, 3600); // Cache for 1 hour
        }

        const plan = getPlanLimits(planName);
        const limit = plan.limits[feature];

        // 2. Feature-level boolean check (e.g. Analytics)
        if (typeof limit === 'boolean') {
            if (!limit) {
                return res.status(httpStatus.FORBIDDEN).json({
                    errorCode: 'SUBSCRIPTION_LIMIT_REACHED',
                    message: `Your current ${planName} plan does not include ${feature}. Please upgrade to continue.`,
                    blockedFeature: feature,
                    upgradeRequired: true,
                });
            }
            return next();
        }

        // 3. Counter-level check (e.g. Staff count)
        const currentUsage = await getCurrentUsage(tenantId, feature);

        if (currentUsage >= limit) {
            return res.status(httpStatus.FORBIDDEN).json({
                errorCode: 'SUBSCRIPTION_LIMIT_REACHED',
                message: `Your current ${planName} plan limit for ${feature} has been reached (${limit}). Please upgrade your plan to continue.`,
                blockedFeature: feature,
                upgradeRequired: true,
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

export default checkSubscriptionLimit;
