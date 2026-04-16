const Feedback = require('../Models/Feedback');
const Salon = require('../Models/Salon');

// @desc    Get all feedbacks
// @route   GET /api/feedbacks
// @access  Public
exports.getFeedbacks = async (req, res) => {
    try {
        const { targetId, targetType, status, salonId } = req.query;
        let query = { status: status || 'Approved' };
        
        if (salonId) query.salonId = salonId;
        if (targetId) query.targetId = targetId;
        if (targetType) query.targetType = targetType;
        
        const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create feedback
// @route   POST /api/feedbacks
// @access  Public (should ideally be auth required, but keeping open for simplicity)
exports.createFeedback = async (req, res) => {
    try {
        let { customerName, rating, comment, targetType, targetId, salonId, targetName } = req.body;

        // If user is logged in, use their details
        const customerId = req.user ? req.user._id : null;
        if (req.user && !customerName) {
            customerName = req.user.name || 'Anonymous';
        }

        const feedback = await Feedback.create({
            salonId: salonId || null,
            customerId,
            customerName: customerName || 'Anonymous',
            rating,
            comment,
            targetType,
            targetId,
            targetName,
            status: 'Pending'
        });

        res.status(201).json({
            success: true,
            data: feedback
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update feedback status
// @route   PATCH /api/feedbacks/:id
// @access  Private/Admin
exports.updateFeedbackStatus = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
            new: true,
            runValidators: true
        });

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        res.status(200).json({
            success: true,
            data: feedback
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
