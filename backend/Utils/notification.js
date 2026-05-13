const admin = require('firebase-admin');
const Notification = require('../Models/Notification');
const Customer = require('../Models/Customer');

/**
 * Send Push Notification to a customer and save to database
 * @param {Object} options
 * @param {string} options.customerId - Customer ID
 * @param {string} options.salonId - Salon ID
 * @param {string} options.title - Notification Title
 * @param {string} options.message - Notification Body
 * @param {string} options.image - Optional Image URL
 * @param {string} options.type - Notification Type (order, booking, system, etc.)
 * @param {string} options.actionUrl - Optional Click Action URL
 * @param {Object} options.data - Additional Data Payload
 */
exports.sendNotification = async ({ customerId, salonId, title, message, image, type = 'system', actionUrl, data = {} }) => {
    try {
        // 1. Save to Database first so user can see it in app list even if push fails
        const newNotification = await Notification.create({
            salonId,
            customerId,
            title,
            message,
            image,
            type,
            actionUrl,
            data
        });

        // 2. Fetch Customer for FCM tokens
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return { success: true, dbId: newNotification._id, message: 'Notification saved but customer not found for push' };
        }

        const tokens = [];
        if (customer.fcmTokenWeb && Array.isArray(customer.fcmTokenWeb)) {
            tokens.push(...customer.fcmTokenWeb);
        }
        if (customer.fcmTokenMobile && Array.isArray(customer.fcmTokenMobile)) {
            tokens.push(...customer.fcmTokenMobile);
        }

        if (tokens.length === 0) {
            return { success: true, dbId: newNotification._id, message: 'Notification saved but no FCM tokens found' };
        }

        // 3. Send Push via Firebase (if initialized)
        // Note: Admin needs to provide firebase-service-account.json and initialize admin in index.js
        try {
            if (admin.apps.length > 0) {
                const messagePayload = {
                    notification: {
                        title: title,
                        body: message,
                        ...(image && { image: image })
                    },
                    data: {
                        ...data,
                        type,
                        notificationId: newNotification._id.toString(),
                        click_action: actionUrl || '/app/notifications',
                        url: actionUrl || '/app/notifications' // Duplicate for redundancy
                    },
                    tokens: tokens
                };

                const response = await admin.messaging().sendEachForMulticast(messagePayload);
                console.log('FCM Success:', response.successCount, 'failures:', response.failureCount);
                return { success: true, dbId: newNotification._id, pushResponse: response };
            } else {
                console.warn('Firebase Admin not initialized. Skipping push.');
                return { success: true, dbId: newNotification._id, message: 'Saved to DB, but Firebase not initialized' };
            }
        } catch (pushError) {
            console.error('FCM Push Error:', pushError.message);
            return { success: true, dbId: newNotification._id, error: pushError.message };
        }
    } catch (error) {
        console.error('Notification System Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send Notification to all customers of a salon (Broadcast)
 */
exports.broadcastNotification = async ({ salonId, title, message, image, type = 'marketing', actionUrl, data = {} }) => {
    try {
        const customers = await Customer.find({ salonId, status: 'active' });
        
        // This could be heavy, in production use a worker/queue
        const promises = customers.map(cust => 
            exports.sendNotification({
                customerId: cust._id,
                salonId,
                title,
                message,
                image,
                type,
                actionUrl,
                data
            })
        );

        await Promise.allSettled(promises);
        return { success: true, count: customers.length };
    } catch (error) {
        console.error('Broadcast Error:', error);
        return { success: false, error: error.message };
    }
};
/**
 * Send Notification to all Admins of a salon
 */
exports.sendAdminNotification = async ({ salonId, title, message, image, type = 'system', actionUrl, data = {} }) => {
    try {
        const User = require('../Models/User');
        const admins = await User.find({ salonId, role: 'admin', status: 'active' });
        
        if (admins.length === 0) return { success: false, message: 'No admins found for this salon' };

        const results = [];
        for (const adminUser of admins) {
            const tokens = [];
            if (adminUser.fcmTokenWeb) tokens.push(...(Array.isArray(adminUser.fcmTokenWeb) ? adminUser.fcmTokenWeb : [adminUser.fcmTokenWeb]));
            if (adminUser.fcmTokenMobile) tokens.push(...(Array.isArray(adminUser.fcmTokenMobile) ? adminUser.fcmTokenMobile : [adminUser.fcmTokenMobile]));

            if (tokens.length > 0) {
                try {
                    if (admin.apps.length > 0) {
                        const messagePayload = {
                            notification: { title, body: message, ...(image && { image }) },
                            data: { ...data, type, click_action: actionUrl || '/admin/dashboard', url: actionUrl || '/admin/dashboard' },
                            tokens: tokens
                        };
                        const response = await admin.messaging().sendEachForMulticast(messagePayload);
                        results.push({ adminId: adminUser._id, success: true, response });
                    }
                } catch (err) {
                    console.error(`Push to admin ${adminUser._id} failed:`, err.message);
                }
            }
        }
        return { success: true, results };
    } catch (error) {
        console.error('Admin Notification Error:', error);
        return { success: false, error: error.message };
    }
};
