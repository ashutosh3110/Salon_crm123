const MembershipPlan = require('../Models/MembershipPlan');

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
