import httpStatus from 'http-status-codes';
import razorpayService from './razorpay.service.js';
import subscriptionService from '../subscription/subscription.service.js';

const createSubscriptionOrder = async (req, res, next) => {
    try {
        const { planId, billingCycle } = req.body;
        const plan = await subscriptionService.getSubscriptionById(planId);
        
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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const isValid = razorpayService.verifyPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(httpStatus.BAD_REQUEST).send({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        res.status(httpStatus.OK).send({
            success: true,
            message: 'Payment verified successfully'
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
