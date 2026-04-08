import httpStatus from 'http-status-codes';
import mongoose from 'mongoose';
import razorpayService from './razorpay.service.js';
import subscriptionService from '../subscription/subscription.service.js';
import Subscription from '../subscription/subscription.model.js';

const createSubscriptionOrder = async (req, res, next) => {
    try {
        const { planId, billingCycle } = req.body;
        let plan;
        if (mongoose.Types.ObjectId.isValid(planId)) {
            plan = await subscriptionService.getSubscriptionById(planId);
        } else {
            plan = await Subscription.findOne({ 
                $or: [
                    { name: new RegExp(`^${planId}$`, 'i') },
                    { tag: new RegExp(`^${planId}$`, 'i') }
                ]
            });
        }
        
        if (!plan) {
            return res.status(404).send({ success: false, message: 'Plan not found' });
        }

        const amount = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        
        // Handle Direct Activation for Free/0-Price Plans
        if (amount === 0) {
            const tenantId = req.user?.tenantId || req.user?._id || req.user?.email || req.headers['x-tenant-id'];
            console.log(`[DEBUG] Attempting Free Activation: User=${req.user?._id}, TenantId=${tenantId}, Role=${req.user?.role}`);
            if (!tenantId) {
                return res.status(httpStatus.UNAUTHORIZED).send({ success: false, message: 'Tenant ID required' });
            }
            await subscriptionService.finalizeUpgrade(tenantId, plan._id, billingCycle, 'free_activation');
            return res.status(httpStatus.OK).send({
                success: true,
                message: 'Plan activated successfully',
                data: { isFree: true }
            });
        }

        // Add GST if applicable
        let totalAmount = amount;
        if (plan.gstStatus && plan.gstType === 'exclusive') {
            totalAmount = amount + (amount * plan.gstRate / 100);
        }

        const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
        const order = await razorpayService.createOrder(
            totalAmount, 
            'INR', 
            `plan_${planId}`, 
            { tenantId, planId, billingCycle }
        );
        
        res.status(httpStatus.OK).send({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        next(error);
    }
};

const verifySubscriptionPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpay_subscription_id, planId, billingCycle } = req.body;
        const tenantId = req.user?.tenantId || req.user?._id || req.user?.email || req.headers['x-tenant-id'];
        
        const isValid = razorpayService.verifyPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            console.error('[RAZORPAY] Invalid signature for order:', razorpay_order_id);
            return res.status(httpStatus.BAD_REQUEST).send({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        console.log(`[RAZORPAY] Payment verified: order=${razorpay_order_id}, tenant=${tenantId}`);

        // Finalize the upgrade in DB ONLY if tenant context exists (Admin Upgrade flow)
        if (tenantId && planId) {
            try {
                await subscriptionService.finalizeUpgrade(tenantId, planId, billingCycle, razorpay_payment_id, razorpay_subscription_id);
                console.log(`[SUBSCRIPTION] Finalized upgrade for tenant: ${tenantId}, plan: ${planId}`);
            } catch (err) {
                console.error(`[SUBSCRIPTION] Upgrade finalization failed:`, err.message);
                return res.status(httpStatus.BAD_REQUEST).send({
                    success: false,
                    message: `Upgrade failed: ${err.message}`
                });
            }
        }

        res.status(httpStatus.OK).send({
            success: true,
            message: req.user?.tenantId ? 'Payment verified and Subscription upgraded successfully' : 'Payment verified successfully'
        });
    } catch (error) {
        next(error);
    }
};

const createWalletRechargeOrder = async (req, res, next) => {
    try {
        const { amount, receipt } = req.body;
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).send({ success: false, message: 'Invalid amount' });
        }

        const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
        const order = await razorpayService.createOrder(
            numericAmount,
            'INR',
            receipt || `wallet_recharge_${Date.now()}`,
            { tenantId, type: 'wallet_recharge' }
        );

        res.status(httpStatus.OK).send({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        next(error);
    }
};

const getSettlements = async (req, res, next) => {
    try {
        const { count, skip, from, to } = req.query;
        const options = {
            count: count ? Number(count) : 10,
            skip: skip ? Number(skip) : 0,
        };
        if (from) options.from = Number(from);
        if (to) options.to = Number(to);

        const settlements = await razorpayService.fetchSettlements(options);
        res.status(httpStatus.OK).send({
            success: true,
            data: settlements
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createSubscriptionOrder,
    verifySubscriptionPayment,
    createWalletRechargeOrder,
    getSettlements,
};
