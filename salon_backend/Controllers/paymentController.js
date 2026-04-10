const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../Models/Payment');
const Salon = require('../Models/Salon');
const Plan = require('../Models/Plan');

const razorpayInstance = () => new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { planId, billingCycle } = req.body;
        const salonId = req.user.salonId;

        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        // Calculate amount in paise (1 INR = 100 Paise)
        // If billingCycle is yearly, we might want to check the plan's yearly price
        // For now, let's assume 'price' is monthly and handled via billingCycle logic in frontend
        // If the user wants specific prices for yearly, we use them.
        
        const amount = plan.price * 100; // Assuming plan.price is already adjusted for cycle in request or derived

        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const razorpay = razorpayInstance();
        const order = await razorpay.orders.create(options);

        // Store payment attempt
        await Payment.create({
            salonId,
            planId,
            orderId: order.id,
            amount: plan.price,
            billingCycle,
            status: 'created'
        });

        res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (err) {
        console.error('Razorpay Order Error:', err);
        res.status(500).json({ success: false, message: 'Payment initialization failed' });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Payment success
            const payment = await Payment.findOne({ orderId: razorpay_order_id });
            if (!payment) {
                return res.status(404).json({ success: false, message: 'Payment record not found' });
            }

            payment.paymentId = razorpay_payment_id;
            payment.signature = razorpay_signature;
            payment.status = 'captured';
            await payment.save();

            // Update Salon Subscription Status
            const plan = await Plan.findById(payment.planId);
            const salon = await Salon.findById(payment.salonId);

            if (salon && plan) {
                salon.subscriptionPlan = plan.name;
                salon.status = 'active';
                salon.isActive = true;
                salon.features = plan.features;
                salon.limits = plan.limits;
                
                // Set expiry date
                const expiryDate = new Date();
                if (payment.billingCycle === 'yearly') {
                    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                } else {
                    expiryDate.setMonth(expiryDate.getMonth() + 1);
                }
                salon.subscriptionExpiry = expiryDate;
                
                await salon.save();
            }

            res.json({
                success: true,
                message: 'Payment verified and plan activated'
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        console.error('Payment Verification Error:', err);
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
};
