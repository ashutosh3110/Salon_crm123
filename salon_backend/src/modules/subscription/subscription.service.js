import mongoose from 'mongoose';
import subscriptionRepository from './subscription.repository.js';
import Subscription from './subscription.model.js';
import Tenant from '../tenant/tenant.model.js';
import Billing from '../billing/billing.model.js';
import billingRepository from '../billing/billing.repository.js';
import CancellationFeedback from './cancellation.model.js';
import razorpayService from '../billing/razorpay.service.js';

const createSubscription = async (subscriptionBody) => {
    // 1. Create locally first
    const sub = await subscriptionRepository.create(subscriptionBody);

    // 2. Try to sync with Razorpay (non-blocking for now, or you can await)
    try {
        const razorpayService = (await import('../billing/razorpay.service.js')).default;
        if (sub.monthlyPrice > 0) {
            const rzpMonthly = await razorpayService.createPlan(sub.name, sub.monthlyPrice, 'monthly');
            sub.razorpayMonthlyPlanId = rzpMonthly.id;
        }
        if (sub.yearlyPrice > 0) {
            const rzpYearly = await razorpayService.createPlan(sub.name, sub.yearlyPrice, 'yearly');
            sub.razorpayYearlyPlanId = rzpYearly.id;
        }
        await sub.save();
    } catch (e) {
        console.warn(`[SUBSCRIPTION SERVICE] Razorpay Sync Failed:`, e.message);
    }
    
    return sub;
};

const querySubscriptions = async (filter, options) => {
    return subscriptionRepository.find(filter, options);
};

const getSubscriptionById = async (id) => {
    return subscriptionRepository.findOne({ _id: id });
};

const updateSubscriptionById = async (subscriptionId, updateBody) => {
    const existing = await getSubscriptionById(subscriptionId);
    if (!existing) throw new Error('Subscription not found');

    const { _id, id, createdAt, updatedAt, ...cleanUpdate } = updateBody;
    
    // Check if price changed to update Razorpay
    const monthlyPriceChanged = cleanUpdate.monthlyPrice != null && cleanUpdate.monthlyPrice !== existing.monthlyPrice;
    const yearlyPriceChanged = cleanUpdate.yearlyPrice != null && cleanUpdate.yearlyPrice !== existing.yearlyPrice;

    const subscription = await subscriptionRepository.updateOne({ _id: subscriptionId }, cleanUpdate);
    
    // Cascade update to all tenants using this plan
    if (cleanUpdate.features || cleanUpdate.limits || cleanUpdate.name) {
        console.log(`[SUBSCRIPTION SERVICE] Cascading updates for plan: ${existing.tag || existing.name}`);
        
        const updateFields = {};
        if (cleanUpdate.features) updateFields.features = subscription.features;
        if (cleanUpdate.limits) updateFields.limits = subscription.limits;
        if (cleanUpdate.name) updateFields.subscriptionPlan = subscription.name.toLowerCase();

        // Build a robust filter to match tenants on this plan
        const possiblePlanIdentifiers = [
            existing.tag,
            existing.name.toLowerCase(),
            existing.name,
            subscription.tag,
            subscription.name.toLowerCase()
        ].filter(Boolean);

        console.log(`[DEBUG] Plan Identifiers:`, possiblePlanIdentifiers);

        const filter = {
            subscriptionPlan: { $in: possiblePlanIdentifiers }
        };
        
        console.log(`[DEBUG] Update Filter:`, JSON.stringify(filter));
        console.log(`[DEBUG] Update Fields:`, JSON.stringify(updateFields));

        const updateResult = await Tenant.updateMany(filter, { $set: updateFields });
        console.log(`[SUBSCRIPTION SERVICE] Updated ${updateResult.modifiedCount} tenants.`);
    }
    
    if (monthlyPriceChanged || yearlyPriceChanged) {
        try {
            const razorpayService = (await import('../billing/razorpay.service.js')).default;
            const updated = await getSubscriptionById(subscriptionId); // Get fresh data
            
            if (monthlyPriceChanged && updated.monthlyPrice > 0) {
                const rzpMonthly = await razorpayService.createPlan(updated.name, updated.monthlyPrice, 'monthly');
                updated.razorpayMonthlyPlanId = rzpMonthly.id;
            }
            if (yearlyPriceChanged && updated.yearlyPrice > 0) {
                const rzpYearly = await razorpayService.createPlan(updated.name, updated.yearlyPrice, 'yearly');
                updated.razorpayYearlyPlanId = rzpYearly.id;
            }
            await updated.save();
        } catch (e) {
            console.warn(`[SUBSCRIPTION SERVICE] Razorpay Update Sync Failed:`, e.message);
        }
    }

    return subscription;
};

const deleteSubscriptionById = async (subscriptionId) => {
    const subscription = await getSubscriptionById(subscriptionId);
    if (!subscription) {
        throw new Error('Subscription not found');
    }
    await subscriptionRepository.deleteOne({ _id: subscriptionId });
    return subscription;
};

const getSubscriptionStats = async () => {
    const response = await subscriptionRepository.find({}, { limit: 1000 });
    const subscriptions = response.results;
    
    const totalPlans = subscriptions.length;
    const activePlans = subscriptions.filter(s => s.active).length;
    const totalSalons = subscriptions.reduce((acc, s) => acc + (s.salonsCount || 0), 0);
    const estimatedMRR = subscriptions.reduce((acc, s) => acc + ((s.salonsCount || 0) * s.monthlyPrice), 0);

    return {
        totalPlans,
        activePlans,
        totalSalons,
        estimatedMRR
    };
};

const finalizeUpgrade = async (tenantId, planId, billingCycle, paymentId, subscriptionId = null) => {
    if (!tenantId || !planId) {
        console.error(`[SUBSCRIPTION] Missing critical IDs: tenantId=${tenantId}, planId=${planId}`);
        throw new Error('Missing Tenant ID or Plan ID for upgrade');
    }
    
    console.log(`[SUBSCRIPTION] Finalizing upgrade: tenant=${tenantId}, plan=${planId}, cycle=${billingCycle}`);
    
    let plan;
    // ... plan lookup logic same as before ...
    if (mongoose.Types.ObjectId.isValid(planId)) {
        plan = await getSubscriptionById(planId);
    } else {
        plan = await subscriptionRepository.findOne({ 
            $or: [
                { name: new RegExp(`^${planId}$`, 'i') },
                { tag: new RegExp(`^${planId}$`, 'i') }
            ]
        });
    }

    if (!plan) {
        console.error(`[SUBSCRIPTION] Plan not found for ID/Name: ${planId}`);
        throw new Error('Subscription plan not found');
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
        console.error(`[SUBSCRIPTION] Tenant not found: ${tenantId}`);
        throw new Error('Tenant not found');
    }

    // Update Tenant
    const now = new Date();
    const expiry = new Date(now);
    if (billingCycle === 'yearly') {
        expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
        expiry.setMonth(expiry.getMonth() + 1);
    }

    tenant.subscriptionPlan = plan.name.toLowerCase();
    tenant.status = 'active';
    tenant.features = { ...plan.features };
    tenant.limits = { ...plan.limits };
    tenant.subscriptionExpiry = expiry;
    if (subscriptionId) tenant.razorpaySubscriptionId = subscriptionId;
    
    await tenant.save();

    // Create Invoice/Billing Record
    const count = await billingRepository.model.countDocuments();
    const invoiceNumber = `SUB-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    
    // Ensure billingCycle is lowercase for comparison
    const cycle = (billingCycle || 'monthly').toLowerCase();
    const amount = cycle === 'yearly' ? (plan.yearlyPrice || 0) : (plan.monthlyPrice || 0);

    let taxAmount = 0;
    let totalAmount = amount;
    if (plan.gstStatus) {
        if (plan.gstType === 'exclusive') {
            taxAmount = Math.round(amount * (plan.gstRate / 100));
            totalAmount = amount + taxAmount;
        } else {
            taxAmount = amount - Math.round(amount / (1 + (plan.gstRate / 100)));
        }
    }

    const billingData = {
        invoiceNumber: String(invoiceNumber),
        tenantId: new mongoose.Types.ObjectId(tenantId),
        planId: new mongoose.Types.ObjectId(plan._id || plan.id),
        planName: String(plan.name),
        amount: Number(amount) || 0,
        taxAmount: Number(taxAmount) || 0,
        totalAmount: Number(totalAmount) || 0,
        status: 'paid',
        paymentMethod: 'razorpay',
        transactionId: String(paymentId),
        paymentDate: new Date(),
        notes: `Subscription Upgrade to ${plan.name} (${String(cycle)})`,
        billingCycle: String(cycle)
    };

    console.log(`[SUBSCRIPTION] Creating Billing Record (Direct):`, JSON.stringify(billingData, null, 2));

    try {
        const billingDoc = new Billing(billingData);
        await billingDoc.save();
    } catch (err) {
        console.error(`[SUBSCRIPTION] Billing Save Failed:`, err);
        // Special case: if it's already 'paid' but billing fails, we shouldn't block the user but we MUST know why
        throw new Error(`Billing validation failed: ${err.message}`);
    }

    return { tenant, plan };
};

/**
 * Cancel a subscription and record feedback
 * @param {string} tenantId 
 * @param {string} reason 
 * @param {string} comment 
 */
const cancelSubscription = async (tenantId, reason, comment) => {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    console.log(`[SUBSCRIPTION] Processing cancellation for tenant: ${tenant.name} (${tenantId})`);

    // 1. Record Feedback
    await CancellationFeedback.create({
        tenantId,
        plan: tenant.subscriptionPlan,
        reason,
        comment
    });

    // 2. Cancel in Razorpay if active
    if (tenant.razorpaySubscriptionId) {
        try {
            await razorpayService.cancelSubscription(tenant.razorpaySubscriptionId);
            console.log(`[SUBSCRIPTION] Razorpay subscription cancelled: ${tenant.razorpaySubscriptionId}`);
        } catch (error) {
            console.warn(`[SUBSCRIPTION] Razorpay Cancellation Failed:`, error.message);
            // We continue anyway, maybe it was already cancelled or expired in RZP
        }
    }

    // 3. Update Tenant Status
    // We keep status as 'active' and keep expiry date, but mark as cancelled
    // This ensures it works "mahine tk chalna chaiye"
    tenant.isCancelled = true;
    await tenant.save();

    return tenant;
};

export default {
    createSubscription,
    querySubscriptions,
    getSubscriptionById,
    updateSubscriptionById,
    deleteSubscriptionById,
    getSubscriptionStats,
    finalizeUpgrade,
    cancelSubscription
};
