import httpStatus from 'http-status-codes';
import razorpayService from './razorpay.service.js';
import Tenant from '../tenant/tenant.model.js';
import Billing from './billing.model.js';
import billingRepository from './billing.repository.js';
import logger from '../../utils/logger.js';

const handleWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const rawBody = req.rawBody;

        if (!signature || !rawBody) {
            return res.status(httpStatus.BAD_REQUEST).send({ message: 'Missing signature or body' });
        }

        const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            logger.warn('[WEBHOOK] Invalid Razorpay signature detected.');
            return res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid signature' });
        }

        const event = req.body;
        logger.info(`[WEBHOOK] Received Razorpay event: ${event.event}`);

        switch (event.event) {
            case 'subscription.charged':
                await handleSubscriptionCharged(event.payload.subscription.entity, event.payload.payment.entity);
                break;
            case 'subscription.cancelled':
            case 'subscription.halted':
                await handleSubscriptionCancelled(event.payload.subscription.entity);
                break;
            case 'payment.captured':
                await handlePaymentCaptured(event.payload.payment.entity);
                break;
            default:
                logger.debug(`[WEBHOOK] Unhandled event type: ${event.event}`);
        }

        res.status(httpStatus.OK).send({ status: 'ok' });
    } catch (error) {
        logger.error('[WEBHOOK] Process failed:', error);
        next(error);
    }
};

const handleSubscriptionCharged = async (subscription, payment) => {
    const rzpSubscriptionId = subscription.id;
    const tenant = await Tenant.findOne({ razorpaySubscriptionId: rzpSubscriptionId });

    if (!tenant) {
        logger.warn(`[WEBHOOK] Charged subscription mismatch: ${rzpSubscriptionId}. No tenant found.`);
        return;
    }

    // Extend expiry based on status or last expiry
    const now = new Date();
    const currentExpiry = tenant.subscriptionExpiry && tenant.subscriptionExpiry > now ? tenant.subscriptionExpiry : now;
    
    // Default to adding 31 days if it's a monthly plan
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + 31); 

    tenant.subscriptionExpiry = newExpiry;
    tenant.status = 'active';
    await tenant.save();

    // Create Billing record
    const count = await Billing.countDocuments();
    const invoiceNumber = `RZP-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    await billingRepository.create({
        invoiceNumber,
        tenantId: tenant._id,
        planName: tenant.subscriptionPlan,
        amount: payment.amount / 100, // paise to INR
        taxAmount: 0, 
        totalAmount: payment.amount / 100,
        status: 'paid',
        paymentMethod: 'razorpay',
        transactionId: payment.id,
        paymentDate: new Date(),
        notes: `Auto-renewal: ${tenant.subscriptionPlan}`,
        billingCycle: 'monthly' // Placeholder
    });

    logger.info(`[WEBHOOK] Subscription renewed for tenant: ${tenant.name} (${tenant._id}) until ${newExpiry.toISOString()}`);
};

const handleSubscriptionCancelled = async (subscription) => {
    const rzpSubscriptionId = subscription.id;
    const tenant = await Tenant.findOne({ razorpaySubscriptionId: rzpSubscriptionId });

    if (tenant) {
        tenant.status = 'suspended';
        await tenant.save();
        logger.warn(`[WEBHOOK] Subscription CANCELLED. Tenant suspended: ${tenant.name} (${tenant._id})`);
    }
};

const handlePaymentCaptured = async (payment) => {
    // Logic for capturing one-time orders (e.g., manual upgrades or wallet)
    const tenantId = payment.notes?.tenantId;
    const planId = payment.notes?.planId;
    const billingCycle = payment.notes?.billingCycle || 'monthly';

    if (tenantId && planId) {
        logger.info(`[WEBHOOK] One-time payment captured for tenant ${tenantId}. Finalizing upgrade...`);
        try {
            // Import subscription service dynamically to avoid circular dependencies if any
            const { default: subscriptionService } = await import('../subscription/subscription.service.js');
            await subscriptionService.finalizeUpgrade(tenantId, planId, billingCycle, payment.id);
        } catch (err) {
            logger.error(`[WEBHOOK] Failed to finalize upgrade for tenant ${tenantId}:`, err);
        }
    }
};

export default {
    handleWebhook
};
