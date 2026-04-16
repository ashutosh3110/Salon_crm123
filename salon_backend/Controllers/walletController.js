const Customer = require('../Models/Customer');
const WalletTransaction = require('../Models/WalletTransaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Salon = require('../Models/Salon');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');

// Initialize Razorpay
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    console.warn('Razorpay keys are missing in walletController.');
}


// @desc    Get wallet balance and transactions
// @route   GET /api/wallet
// @access  Private (Customer)
exports.getWalletDetails = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const transactions = await WalletTransaction.find({ customerId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            balance: customer.walletBalance || 0,
            transactions: transactions.map(tx => ({
                id: tx._id,
                amount: tx.amount,
                type: tx.type,
                description: tx.description,
                date: tx.createdAt,
                status: tx.status
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create top-up order
// @route   POST /api/wallet/topup/order
// @access  Private (Customer)
exports.createTopupOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' });
        }

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: `topup_${Date.now()}`
        };

        if (!razorpay) {
            return res.status(500).json({ success: false, message: 'Razorpay is not configured' });
        }
        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify top-up payment and update balance
// @route   POST /api/wallet/topup/verify
// @access  Private (Customer)
exports.verifyTopup = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = req.body;

        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'lW6qHLoV7I0qXW8S0S8S0S8S')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpaySignature) {
            // Update customer balance
            const customer = await Customer.findByIdAndUpdate(
                req.user._id,
                { $inc: { walletBalance: Number(amount) } },
                { new: true }
            );

            // Create transaction record
            await WalletTransaction.create({
                customerId: req.user._id,
                salonId: customer.salonId,
                amount: Number(amount),
                type: 'CREDIT',
                description: 'Wallet Top-up via Razorpay',
                paymentId: razorpayPaymentId,
                orderId: razorpayOrderId,
                status: 'COMPLETED'
            });
            
            // Award Loyalty Points
            try {
                const salon = await Salon.findById(customer.salonId);
                if (salon && salon.loyaltySetting && salon.loyaltySetting.active) {
                    const rate = salon.loyaltySetting.pointsRate || 100;
                    const points = Math.floor(Number(amount) / rate);
                    if (points > 0) {
                        await Customer.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: points } });
                        await LoyaltyTransaction.create({
                            customerId: req.user._id,
                            salonId: customer.salonId,
                            amount: points,
                            type: 'EARN',
                            description: `Points earned on Wallet Top-up (₹${amount})`
                        });
                    }
                }
            } catch (le) { console.error('Loyalty Error:', le); }

            res.json({
                success: true,
                balance: customer.walletBalance,
                message: 'Wallet top-up successful'
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
