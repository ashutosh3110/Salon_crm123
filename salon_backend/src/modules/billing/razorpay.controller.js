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
        
        // Add GST if applicable
        let totalAmount = amount;
        if (plan.gstStatus && plan.gstType === 'exclusive') {
            totalAmount = amount + (amount * plan.gstRate / 100);
        }

        const order = await razorpayService.createOrder(totalAmount, 'INR', `plan_${planId}`);
        
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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, billingCycle } = req.body;
        const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
        
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
            await subscriptionService.finalizeUpgrade(tenantId, planId, billingCycle, razorpay_payment_id);
            console.log(`[SUBSCRIPTION] Finalized upgrade for tenant: ${tenantId}, plan: ${planId}`);
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

        const order = await razorpayService.createOrder(
            numericAmount,
            'INR',
            receipt || `wallet_recharge_${Date.now()}`
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

export default {
    createSubscriptionOrder,
    verifySubscriptionPayment,
    createWalletRechargeOrder,
};
