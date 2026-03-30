import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

const createOrder = async (amount, currency = 'INR', receipt = 'receipt_1') => {
    const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
        currency,
        receipt,
    };

    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        throw new Error(`Razorpay Order Error: ${error.message || 'Unknown Error'}`);
    }
};

const verifyPayment = (orderId, paymentId, signature) => {
    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
        .update(orderId + "|" + paymentId)
        .digest('hex');

    return generated_signature === signature;
};

const createPlan = async (name, amount, period = 'monthly', description = '') => {
    const options = {
        period: period === 'yearly' ? 'yearly' : 'monthly',
        interval: 1, // 1 month or 1 year
        item: {
            name: `${name} (${period})`,
            amount: Math.round(amount * 100), // in paise
            currency: 'INR',
            description: description || `Plan for ${name} ${period} subscription`,
        },
    };

    try {
        const plan = await razorpay.plans.create(options);
        return plan;
    } catch (error) {
        console.error(`[RAZORPAY] Create Plan Error:`, error);
        throw new Error(`Razorpay Plan Error: ${error.message}`);
    }
};

export default {
    createOrder,
    verifyPayment,
    createPlan,
};
