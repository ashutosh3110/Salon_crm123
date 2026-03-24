import mongoose from 'mongoose';
import subscriptionRepository from './subscription.repository.js';
import Tenant from '../tenant/tenant.model.js';
import billingRepository from '../billing/billing.repository.js';

const createSubscription = async (subscriptionBody) => {
    return subscriptionRepository.create(subscriptionBody);
};

const querySubscriptions = async (filter, options) => {
    return subscriptionRepository.find(filter, options);
};

const getSubscriptionById = async (id) => {
    return subscriptionRepository.findOne({ _id: id });
};

const updateSubscriptionById = async (subscriptionId, updateBody) => {
    const { _id, id, createdAt, updatedAt, ...cleanUpdate } = updateBody;
    const subscription = await subscriptionRepository.updateOne({ _id: subscriptionId }, cleanUpdate);
    if (!subscription) {
        throw new Error('Subscription not found');
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
