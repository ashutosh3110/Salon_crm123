import billingRepository from './billing.repository.js';
import subscriptionRepository from '../subscription/subscription.repository.js';
import tenantRepository from '../tenant/tenant.repository.js';

const getBillingStats = async () => {
    const rawStats = await billingRepository.getStats();
    
    const totalStats = rawStats.totalRevenue[0] || { total: 0, subtotal: 0, tax: 0 };
    
    return {
        totalRevenue: totalStats.total,
        totalSubtotal: totalStats.subtotal,
        totalTax: totalStats.tax,
        failedCount: rawStats.failedCount[0]?.count || 0,
        refundedAmount: rawStats.refundedAmount[0]?.total || 0,
        monthlyRevenue: rawStats.monthlyRevenue.map(m => ({
            month: m._id,
            revenue: m.revenue,
            subtotal: m.subtotal,
            tax: m.tax
        })),
        planDistribution: rawStats.planDistribution.map(p => ({
            name: p._id || 'Unknown',
            value: p.count,
            revenue: p.revenue
        }))
    };
};

const queryTransactions = async (filter, options) => {
    return billingRepository.find(filter, options);
};

const createManualInvoice = async (invoiceData) => {
    const { tenantId, planId, amount, notes, dueDate } = invoiceData;
    
    // Get tenant and plan details
    const tenant = await tenantRepository.findOne({ _id: tenantId });
    if (!tenant) throw new Error('Tenant not found');
    
    // Generate invoice number WXP-2024-XXXX
    const count = await billingRepository.model.countDocuments();
    const invoiceNumber = `WXP-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    
    const taxAmount = Math.round(amount * 0.18);
    const totalAmount = amount + taxAmount;

    let planName = 'Manual Invoice';
    if (planId) {
        const plan = await subscriptionRepository.findOne({ _id: planId });
        if (plan) planName = plan.name;
    }

    const billingBody = {
        invoiceNumber,
        tenantId,
        planId,
        planName,
        amount,
        taxAmount,
        totalAmount,
        notes,
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        status: 'pending'
    };

    return billingRepository.create(billingBody);
};

export default {
    getBillingStats,
    queryTransactions,
    createManualInvoice
};
