const Notification = require('../Models/Notification');
const { broadcastNotification, sendNotification } = require('../Utils/notification');
const Customer = require('../Models/Customer');
const User = require('../Models/User');
const Staff = require('../Models/Staff');
const Salon = require('../Models/Salon');

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
            { _id: req.params.id, $or: [{ customerId: req.user._id }, { userId: req.user._id }] },
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

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { 
                $or: [{ customerId: req.user._id }, { userId: req.user._id }],
                isRead: false 
            },
            { isRead: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
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

            // Also send WhatsApp manually if targeted to single customer
            try {
                const { sendWhatsAppMessage, checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');
                const customer = await Customer.findById(targetId);
                
                if (customer && customer.phone) {
                    const canSendManual = await checkAndDeductWhatsAppCredit(customer.lastOutletId || salonId);
                    if (canSendManual) {
                        await sendWhatsAppMessage(customer.phone, `${title}\n\n${message}`);
                    } else {
                        console.log(`[Manual-WhatsApp] Skipped: No credits for salon ${salonId}`);
                    }
                }
            } catch (wsErr) {
                console.error('Manual WhatsApp failed:', wsErr.message);
            }
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
        const { token, fcmToken, platform } = req.body;
        const actualToken = token || fcmToken;
        
        if (!actualToken) {
            return res.status(400).json({ success: false, message: 'Token is required (fcmToken)' });
        }

        const userId = req.user.id || req.user._id;
        const phone = req.user.phone;
        const role = req.user.role;
        
        // Detect platform type
        const isMobile = ['android', 'ios', 'mobile', 'app'].includes(String(platform).toLowerCase());
        const updateField = isMobile ? { fcmTokenMobile: actualToken } : { fcmTokenWeb: actualToken };
        const updateQuery = { $addToSet: updateField };

        console.log(`[Notification-Token] User: ${phone}, Platform Received: ${platform}, isMobile: ${isMobile}, Saving to: ${isMobile ? 'fcmTokenMobile' : 'fcmTokenWeb'}`);

        let updatedRecord = null;

        // 1. Try updating the record based on current role
        if (role === 'admin' || role === 'superadmin' || role === 'receptionist') {
            updatedRecord = await User.findByIdAndUpdate(userId, updateQuery, { new: true });
            // If not in User, check Salon (owner account)
            if (!updatedRecord) {
                updatedRecord = await Salon.findByIdAndUpdate(userId, updateQuery, { new: true });
            }
        } else if (role === 'staff' || role === 'stylist') {
            updatedRecord = await Staff.findByIdAndUpdate(userId, updateQuery, { new: true });
        } else {
            updatedRecord = await Customer.findByIdAndUpdate(userId, updateQuery, { new: true });
        }

        // 2. Fallback: If not found by ID (maybe role mismatch in token), try by phone across all collections
        if (!updatedRecord && phone) {
            // Try Customer first
            updatedRecord = await Customer.findOneAndUpdate({ phone: phone }, updateQuery, { new: true });
            
            // Then User
            if (!updatedRecord) {
                updatedRecord = await User.findOneAndUpdate({ phone: phone }, updateQuery, { new: true });
            }
            
            // Then Staff
            if (!updatedRecord) {
                updatedRecord = await Staff.findOneAndUpdate({ phone: phone }, updateQuery, { new: true });
            }

            // Then Salon
            if (!updatedRecord) {
                updatedRecord = await Salon.findOneAndUpdate({ phone: phone }, updateQuery, { new: true });
            }
        }

        if (!updatedRecord) {
            return res.json({
                success: true,
                message: 'Token received, but no account record found to link it with.'
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
