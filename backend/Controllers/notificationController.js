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
        const phone = req.user.phone;
        const updateField = (platform === 'mobile' || platform === 'app') ? { fcmTokenMobile: token } : { fcmTokenWeb: token };

        console.log(`[FCM Register] UserID: ${userId}, Phone: ${phone}, Platform: ${platform}`);

        // Use $addToSet to add token to array without duplicates
        const updateQuery = { $addToSet: updateField };
        console.log(`[FCM Query] ${JSON.stringify(updateQuery)}`);

        // 1. Try direct update by ID
        console.log(`[FCM] Attempting update by ID: ${userId}`);
        let customer = await Customer.findByIdAndUpdate(userId, updateQuery, { new: true });

        // 2. If not found, try by phone number
        if (!customer && phone) {
            console.log(`[FCM] ID match failed, attempting update by phone: ${phone}`);
            customer = await Customer.findOneAndUpdate({ phone: phone }, updateQuery, { new: true });
            
            if (!customer && phone.length >= 10) {
                const last10 = phone.slice(-10);
                console.log(`[FCM] Phone match failed, attempting update by last 10 digits: ${last10}`);
                customer = await Customer.findOneAndUpdate({ phone: new RegExp(last10 + '$') }, updateQuery, { new: true });
            }
        }

        if (!customer) {
            console.error(`[FCM Error] No customer record found for UserID: ${userId} or Phone: ${phone}`);
            return res.json({
                success: true,
                message: 'Token received, but no customer record found to link it with.'
            });
        }

        console.log(`[FCM Success] Token registered for customer: ${customer.name} (${customer._id})`);
        res.json({
            success: true,
            message: 'Token registered successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
