const Notification = require('../Models/Notification');
const { broadcastNotification, sendNotification } = require('../Utils/notification');
const Customer = require('../Models/Customer');

// @desc    Get notifications for a customer
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            customerId: req.user._id,
            salonId: req.user.salonId
        }).sort({ createdAt: -1 }).limit(50);

        res.json({
            success: true,
            data: notifications
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, customerId: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Send manual notification (Admin)
// @route   POST /api/notifications/send
// @access  Private (Admin)
exports.sendManualNotification = async (req, res) => {
    try {
        const { customerId, title, message, image, type, actionUrl } = req.body;
        const salonId = req.user.salonId;
        let targetId = customerId;

        if (customerId === 'self') {
            const myCustomer = await Customer.findOne({ phone: req.user.phone });
            if (!myCustomer) {
                return res.status(404).json({ success: false, message: 'No customer record found with your phone number for testing.' });
            }
            targetId = myCustomer._id;
        }

        if (targetId === 'all') {
            await broadcastNotification({
                salonId,
                title,
                message,
                image,
                type,
                actionUrl
            });
        } else {
            await sendNotification({
                customerId: targetId,
                salonId,
                title,
                message,
                image,
                type,
                actionUrl
            });
        }

        res.json({
            success: true,
            message: 'Notification(s) sent successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Register FCM Token
// @route   POST /api/notifications/register-token
// @access  Private
exports.registerToken = async (req, res) => {
    try {
        const { token, platform } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        const userId = req.user.id || req.user._id;
        const updateField = (platform === 'mobile' || platform === 'app') ? { fcmTokenMobile: token } : { fcmTokenWeb: token };

        // Use $addToSet to add token to array without duplicates
        const updateQuery = { $addToSet: updateField };

        // 1. Try direct update (if they are a customer)
        let customer = await Customer.findByIdAndUpdate(userId, updateQuery, { new: true });

        // 2. If not found, they might be an Admin/Staff testing. Try finding customer by phone.
        if (!customer && req.user.phone) {
            customer = await Customer.findOneAndUpdate({ phone: req.user.phone }, updateQuery, { new: true });
        }

        if (!customer) {
            // Silently fail or return success to prevent console errors for Admins
            return res.json({
                success: true,
                message: 'Token received, but no customer record found to link it with.'
            });
        }

        res.json({
            success: true,
            message: 'Token registered successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
