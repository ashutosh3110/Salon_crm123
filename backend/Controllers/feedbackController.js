const Feedback = require('../Models/Feedback');
const Salon = require('../Models/Salon');

// @desc    Get all feedbacks
// @route   GET /api/feedbacks
// @access  Public
exports.getFeedbacks = async (req, res) => {
    try {
        const { targetId, targetType, status, salonId, outletId } = req.query;
        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        } else if (!status) {
            query.status = 'Approved';
        }
        // If status is 'all', we don't add status to query, fetching everything
        
        if (salonId) query.salonId = salonId;
        if (outletId) {
            query.$or = [
                { outletId: outletId },
                { outletId: { $exists: false } },
                { outletId: null }
            ];
        }
        if (targetId) query.targetId = targetId;
        if (targetType) query.targetType = targetType;
        
        const feedbacks = await Feedback.find(query)
            .populate('outletId', 'name')
            .populate('customerId', 'name phone')
            .sort({ createdAt: -1 });
        
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
        let { customerName, customerPhone, rating, comment, targetType, targetId, salonId, outletId, targetName } = req.body;

        // If user is logged in, use their details
        const customerId = req.user ? req.user._id : null;
        if (req.user) {
            if (!customerName) customerName = req.user.name || 'Anonymous';
            if (!customerPhone) customerPhone = req.user.phone;
        }

        const feedback = await Feedback.create({
            salonId: salonId || null,
            outletId: outletId || null,
            customerId,
            customerName: customerName || 'Anonymous',
            customerPhone,
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

        // Notify Admin (Firebase Only)
        try {
            const { sendAdminNotification } = require('../Utils/notification');
            await sendAdminNotification({
                salonId: salonId || feedback.salonId,
                title: 'New Review Received! ⭐',
                message: `New ${rating} star review from ${customerName || 'Customer'} for ${targetName || 'your outlet'}.`,
                type: 'system',
                actionUrl: '/admin/feedbacks'
            });
        } catch (adminErr) {
            console.error('Admin Review Notification failed:', adminErr.message);
        }
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

        // Send Notifications if approved
        if (req.body.status === 'Approved' && feedback) {
            try {
                const { sendNotification } = require('../Utils/notification');
                const { sendWhatsAppMessage } = require('../Utils/whatsapp');
                const Customer = require('../Models/Customer');
                const customer = await Customer.findById(feedback.customerId);

                if (customer) {
                    const msg = `Hi ${customer.name}, your review for ${feedback.targetName || 'our service'} has been approved and is now live! Thank you for your feedback. ✨`;
                    
                    // 1. Firebase
                    await sendNotification({
                        customerId: customer._id,
                        salonId: feedback.salonId,
                        title: 'Review Approved! ⭐',
                        message: msg,
                        type: 'system'
                    });

                    // 2. WhatsApp
                    if (customer.phone) {
                        const { checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');
                        const canSendFeed = await checkAndDeductWhatsAppCredit(feedback.outletId || customer.lastOutletId);
                        if (canSendFeed) {
                            await sendWhatsAppMessage(customer.phone, msg);
                        }
                    }
                }
            } catch (notifErr) {
                console.error('Feedback Notification failed:', notifErr.message);
            }
        }

        res.status(200).json({
            success: true,
            data: feedback
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// @desc    Get feedbacks for a specific customer
// @route   GET /api/feedbacks/customer/:customerId
// @access  Private
exports.getCustomerFeedbacks = async (req, res) => {
    try {
        const { status } = req.query;
        let query = { customerId: req.params.customerId };
        if (status) query.status = status;

        const feedbacks = await Feedback.find(query)
            .populate('salonId', 'name logo')
            .populate('outletId', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
