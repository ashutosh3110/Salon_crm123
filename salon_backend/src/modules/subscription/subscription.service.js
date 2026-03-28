import mongoose from 'mongoose';
import subscriptionRepository from './subscription.repository.js';
import Tenant from '../tenant/tenant.model.js';
import billingRepository from '../billing/billing.repository.js';

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

        const filter = existing.tag ? { subscriptionPlan: existing.tag } : { subscriptionPlan: existing.name.toLowerCase() };
        
        const updateResult = await Tenant.updateMany(filter, updateFields);
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

const finalizeUpgrade = async (tenantId, planId, billingCycle, paymentId) => {
    console.log(`[SUBSCRIPTION] Finalizing upgrade: tenant=${tenantId}, plan=${planId}, cycle=${billingCycle}`);
    
    let plan;
    // Try by ID first, then by name if ID looks like a slug
    if (mongoose.Types.ObjectId.isValid(planId)) {
        plan = await getSubscriptionById(planId);
    } else {
        // Fallback for mock IDs like 'pro', 'basic'
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
    tenant.subscriptionPlan = plan.name.toLowerCase();
    tenant.status = 'active';
    tenant.features = { ...plan.features };
    tenant.limits = { ...plan.limits };
    await tenant.save();

    // Create Invoice/Billing Record
    const count = await billingRepository.model.countDocuments();
    const invoiceNumber = `SUB-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    
    const amount = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
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

    await billingRepository.create({
        invoiceNumber,
        tenantId,
        planId,
        planName: plan.name,
        amount,
        taxAmount,
        totalAmount,
        status: 'paid',
        paymentMethod: 'razorpay',
        transactionId: paymentId,
        paymentDate: new Date(),
        notes: `Subscription Upgrade to ${plan.name} (${billingCycle})`,
        billingCycle
    });

    return { tenant, plan };
};

export default {
    createSubscription,
    querySubscriptions,
    getSubscriptionById,
    updateSubscriptionById,
    deleteSubscriptionById,
    getSubscriptionStats,
    finalizeUpgrade
};
