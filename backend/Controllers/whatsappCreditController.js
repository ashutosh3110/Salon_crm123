const Razorpay = require('razorpay');
const crypto = require('crypto');
const Salon = require('../Models/Salon');
const Setting = require('../Models/Setting');
const WhatsAppCreditTransaction = require('../Models/WhatsAppCreditTransaction');

// Initialize Razorpay
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

// @desc    Create credit purchase order
// @route   POST /api/whatsapp/buy-credits/order
// @access  Private (Admin)
exports.createCreditOrder = async (req, res) => {
    try {
        const { credits } = req.body;
        const salonId = req.user.salonId;
        
        if (!credits) {
            return res.status(400).json({ success: false, message: 'Credits are required' });
        }

        const settings = await Setting.findOne();
        const pricing = settings?.whatsappPricing || { pricePerMessage: 0.50, minPurchaseQty: 1000 };

        if (credits < pricing.minPurchaseQty) {
            return res.status(400).json({ success: false, message: `Minimum purchase is ${pricing.minPurchaseQty} credits` });
        }

        const amount = Math.round(credits * pricing.pricePerMessage * 100); // in paise

        const options = {
            amount,
            currency: 'INR',
            receipt: `wa_credit_${Date.now()}`
        };

        if (!razorpay) {
            return res.status(500).json({ success: false, message: 'Razorpay is not configured' });
        }

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
            pricing
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify credit payment
// @route   POST /api/whatsapp/buy-credits/verify
// @access  Private (Admin)
exports.verifyCreditPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, credits } = req.body;
        const salonId = req.user.salonId;

        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpaySignature) {
            const settings = await Setting.findOne();
            const pricePerCredit = settings?.whatsappPricing?.pricePerMessage || 0.50;

            // Update Salon credits
            const salon = await Salon.findByIdAndUpdate(
                salonId,
                { $inc: { 'whatsappSettings.whatsappCredits': credits } },
                { new: true }
            );

            // Log Transaction
            await WhatsAppCreditTransaction.create({
                salonId,
                amount: credits * pricePerCredit,
                credits,
                pricePerCredit,
                paymentId: razorpayPaymentId,
                orderId: razorpayOrderId,
                status: 'COMPLETED'
            });

            res.json({
                success: true,
                credits: salon.whatsappSettings.whatsappCredits,
                message: 'WhatsApp credits added successfully'
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    SuperAdmin manual credit update
// @route   POST /api/whatsapp-credits/superadmin/update
// @access  Private (SuperAdmin)
exports.superAdminUpdateCredits = async (req, res) => {
    try {
        const { salonId, credits, reason } = req.body;
        
        if (!salonId || credits === undefined) {
            return res.status(400).json({ success: false, message: 'Salon ID and credits are required' });
        }

        const salon = await Salon.findByIdAndUpdate(
            salonId,
            { $inc: { 'whatsappSettings.whatsappCredits': credits } },
            { new: true }
        );

        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        // Log Transaction
        await WhatsAppCreditTransaction.create({
            salonId,
            amount: 0, 
            credits,
            pricePerCredit: 0,
            paymentId: 'SUPERADMIN_MANUAL',
            orderId: reason || 'Manual adjustment by SuperAdmin',
            status: 'COMPLETED'
        });

        res.json({
            success: true,
            credits: salon.whatsappSettings.whatsappCredits,
            message: `Successfully added ${credits} credits to ${salon.name}`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get credit logs for a salon
// @route   GET /api/whatsapp/credits/logs
// @access  Private (Admin)
exports.getOutletCreditLogs = async (req, res) => {
    try {
        const salonId = req.user.role === 'superadmin' ? req.query.salonId : req.user.salonId;
        const logs = await WhatsAppCreditTransaction.find({ salonId })
            .sort({ createdAt: -1 });
            
        res.json({
            success: true,
            data: logs
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
