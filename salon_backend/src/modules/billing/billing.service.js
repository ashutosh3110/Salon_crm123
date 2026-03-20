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

const queryMyTransactions = async (tenantId, options) => {
    return billingRepository.find({ tenantId }, options);
};

const createManualInvoice = async (invoiceData) => {
    const { tenantId, planId, amount, notes, dueDate } = invoiceData;
    
    // Get tenant and plan details
    const tenant = await tenantRepository.findOne({ _id: tenantId });
    if (!tenant) throw new Error('Tenant not found');
    
    // Generate invoice number WXP-2024-XXXX
    const count = await billingRepository.model.countDocuments();
    const invoiceNumber = `WXP-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    
    let planName = 'Manual Invoice';
    let taxAmount = 0;
    let totalAmount = 0;
    let finalBaseAmount = amount;

    if (planId) {
        const plan = await subscriptionRepository.findOne({ _id: planId });
        if (plan) {
            planName = plan.name;
            const rate = plan.gstRate || 0;
            if (plan.gstStatus) {
                if (plan.gstType === 'inclusive') {
                    finalBaseAmount = Math.round(amount / (1 + (rate / 100)));
                    taxAmount = amount - finalBaseAmount;
                    totalAmount = amount;
                } else {
                    // exclusive
                    taxAmount = Math.round(amount * (rate / 100));
                    totalAmount = amount + taxAmount;
                    finalBaseAmount = amount;
                }
            } else {
                taxAmount = 0;
                totalAmount = amount;
                finalBaseAmount = amount;
            }
        }
    } else {
        // Fallback for manual invoices without a linked plan (e.g. 18% Exclusive)
        taxAmount = Math.round(amount * 0.18);
        totalAmount = amount + taxAmount;
        finalBaseAmount = amount;
    }

    const billingBody = {
        invoiceNumber,
        tenantId,
        planId,
        planName,
        amount: finalBaseAmount,
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
    queryMyTransactions,
    createManualInvoice
};
