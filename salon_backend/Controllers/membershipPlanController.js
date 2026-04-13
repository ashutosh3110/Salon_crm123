const MembershipPlan = require('../Models/MembershipPlan');
const CustomerMembership = require('../Models/CustomerMembership');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_8sYbzHWidwe5Zw',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET'
});

// @desc    Get all membership plans for a salon
// @route   GET /api/membership-plans
// @access  Public/Private
exports.getMembershipPlans = async (req, res) => {
    try {
        let salonId = req.user?.salonId || req.query.salonId;
        
        const query = {};
        if (salonId) query.salonId = salonId;
        
        // If public route, only show active plans
        if (!req.user) {
            query.isActive = true;
        }

        const plans = await MembershipPlan.find(query);

        res.status(200).json({
            success: true,
            count: plans.length,
            data: plans
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single membership plan
// @route   GET /api/membership-plans/:id
// @access  Private
exports.getMembershipPlan = async (req, res) => {
    try {
        const plan = await MembershipPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create new membership plan
// @route   POST /api/membership-plans
// @access  Private (Admin/Manager)
exports.createMembershipPlan = async (req, res) => {
    try {
        req.body.salonId = req.user.salonId;
        
        const plan = await MembershipPlan.create(req.body);

        res.status(201).json({
            success: true,
            data: plan
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update membership plan
// @route   PATCH /api/membership-plans/:id
// @access  Private (Admin/Manager)
exports.updateMembershipPlan = async (req, res) => {
    try {
        let plan = await MembershipPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        // Make sure user owns plan
        if (plan.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this plan'
            });
        }

        plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete membership plan
// @route   DELETE /api/membership-plans/:id
// @access  Private (Admin/Manager)
exports.deleteMembershipPlan = async (req, res) => {
    try {
        const plan = await MembershipPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        // Make sure user owns plan
        if (plan.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this plan'
            });
        }

        await plan.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create Razorpay order for membership
// @route   POST /api/loyalty/membership/order
// @access  Private (Customer)
exports.createMembershipOrder = async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await MembershipPlan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        const options = {
            amount: plan.price * 100, // in paise
            currency: 'INR',
            receipt: `mem_${req.user._id}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify membership payment and activate
// @route   POST /api/loyalty/membership/verify
// @access  Private (Customer)
exports.verifyMembershipPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET')
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        const plan = await MembershipPlan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        // Calculate expiry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (plan.duration || 30));

        // Create or Update membership
        const membership = await CustomerMembership.findOneAndUpdate(
            { customerId: req.user._id, salonId: plan.salonId },
            {
                planId,
                status: 'active',
                expiryDate,
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                amount: plan.price
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: membership });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get active membership for customer
// @route   GET /api/loyalty/membership/active
// @access  Private (Customer)
exports.getActiveMembership = async (req, res) => {
    try {
        const membership = await CustomerMembership.findOne({
            customerId: req.user._id,
            status: 'active',
            expiryDate: { $gt: new Date() }
        }).populate('planId');

        res.json({ success: true, data: membership });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
