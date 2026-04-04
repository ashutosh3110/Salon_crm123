import { getMessaging } from '../../config/firebase.js';
import Notification from './notification.model.js';
import User from '../user/user.model.js';
import Client from '../client/client.model.js';
import whatsappService from './whatsapp.service.js';

class NotificationService {
    /**
     * Send push notification via FCM and save to database
     * @param {Object} params
     * @param {string} params.recipientId - User or Client _id
     * @param {string} [params.recipientType='user'] - 'user' or 'client'
     * @param {string} [params.tenantId] - Tenant scope
     * @param {string} params.type - Notification type
     * @param {string} params.title - Notification title
     * @param {string} params.body - Notification body
     * @param {Object} [params.data={}] - Extra payload data
     * @param {string} [params.actionUrl=''] - Frontend route on click
     */
    async sendNotification({ recipientId, recipientType = 'user', tenantId, type, title, body, data = {}, actionUrl = '' }) {
        let pushSent = false;

        try {
            // 1. Save notification to DB
            const notification = await Notification.create({
                recipientId,
                recipientType,
                tenantId: tenantId || undefined,
                type,
                title,
                body,
                data,
                actionUrl,
            });

            // 2. Try sending push via FCM
            const messaging = getMessaging();
            if (!messaging) {
                console.warn('[Notification] FCM not initialized (Check PRIVATE_KEY or PROJECT_ID)');
            } else {
                let doc;
                if (recipientType === 'client') {
                    doc = await Client.findById(recipientId).select('fcmTokens phone name');
                } else {
                    doc = await User.findById(recipientId).select('fcmTokens email');
                }

                const tokens = doc?.fcmTokens?.filter(Boolean) || [];
                console.log(`[Notification] Found ${tokens.length} tokens for ${recipientType}: ${doc?.email || doc?.phone || recipientId}`);

                if (tokens.length > 0) {
                    const results = await Promise.allSettled(
                        tokens.map(token => {
                            // Create a promise that rejects after 10 seconds
                            const timeoutPromise = new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('FCM Timeout (10s)')), 10000)
                            );

                            // Race the actual send against the timeout
                            return Promise.race([
                                messaging.send({
                                    token,
                                    notification: { title, body },
                                    data: {
                                        type,
                                        notificationId: notification._id.toString(),
                                        actionUrl,
                                        ...Object.fromEntries(
                                            Object.entries(data).map(([k, v]) => [k, String(v)])
                                        ),
                                    },
                                    webpush: {
                                        notification: {
                                            icon: '/icon.png',
                                            badge: '/icon.png',
                                            tag: type,
                                        },
                                        fcmOptions: {
                                            link: actionUrl || '/',
                                        },
                                    },
                                }),
                                timeoutPromise
                            ]);
                        })
                    );

                    // Remove invalid tokens
                    const invalidTokens = [];
                    results.forEach((result, idx) => {
                        if (result.status === 'fulfilled') {
                            pushSent = true;
                            console.log(`[Notification] FCM Success for ${recipientType} ${doc?.email || doc?.phone} (Token ${idx})`);
                        } else {
                            const errorCode = result.reason?.code;
                            if (
                                errorCode === 'messaging/invalid-registration-token' ||
                                errorCode === 'messaging/registration-token-not-registered'
                            ) {
                                invalidTokens.push(tokens[idx]);
                            }
                            console.warn(`[Notification] FCM send failed for token ${idx}:`, result.reason?.message);
                        }
                    });

                    // Clean up invalid tokens
                    if (invalidTokens.length > 0) {
                        const Model = recipientType === 'client' ? Client : User;
                        await Model.findByIdAndUpdate(recipientId, {
                            $pull: { fcmTokens: { $in: invalidTokens } },
                        });
                        console.log(`[Notification] Removed ${invalidTokens.length} invalid FCM token(s) from ${recipientType}`);
                    }
                }
            }

            // Update push status
            notification.pushSent = pushSent;
            await notification.save();

            console.log(`[Notification] Finished attempt for ${recipientId}. Push successfully sent: ${pushSent}`);
            return notification;
        } catch (error) {
            console.error('[NotificationService] Fatal Error:', error.message);
            // Still try to save if notification wasn't created
            return null;
        }
    }

    /**
     * Send notification to multiple users
     */
    async sendToMany(recipientIds, { tenantId, type, title, body, data, actionUrl }) {
        const results = await Promise.allSettled(
            recipientIds.map(recipientId =>
                this.sendNotification({ recipientId, tenantId, type, title, body, data, actionUrl })
            )
        );
        return results.filter(r => r.status === 'fulfilled').map(r => r.value);
    }

    /**
     * Send notification to all users with a specific role in a tenant
     */
    async sendToRole(tenantId, role, { type, title, body, data, actionUrl }) {
        const users = await User.find({ tenantId, role, status: 'active' }).select('_id');
        if (users.length === 0) return [];
        return this.sendToMany(
            users.map(u => u._id),
            { tenantId, type, title, body, data, actionUrl }
        );
    }

    /**
     * Get notifications for a user (paginated)
     */
    async getNotifications(recipientId, { page = 1, limit = 20, unreadOnly = false } = {}) {
        const filter = { recipientId };
        if (unreadOnly) filter.isRead = false;

        const skip = (page - 1) * limit;
        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification.countDocuments(filter),
            Notification.countDocuments({ recipientId, isRead: false }),
        ]);

        return {
            results: notifications,
            total,
            unreadCount,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Mark notification(s) as read
     */
    async markAsRead(recipientId, notificationIds) {
        if (notificationIds && notificationIds.length > 0) {
            await Notification.updateMany(
                { _id: { $in: notificationIds }, recipientId },
                { isRead: true }
            );
        }
        return { success: true };
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(recipientId) {
        await Notification.updateMany(
            { recipientId, isRead: false },
            { isRead: true }
        );
        return { success: true };
    }

    /**
     * Delete a notification
     */
    async deleteNotification(recipientId, notificationId) {
        await Notification.deleteOne({ _id: notificationId, recipientId });
        return { success: true };
    }

    /**
     * Get unread count for a user
     */
    async getUnreadCount(recipientId) {
        const count = await Notification.countDocuments({ recipientId, isRead: false });
        return { unreadCount: count };
    }

    /**
     * Register FCM token for a user
     */
    async registerToken(userId, fcmToken, userType = 'user') {
        if (!fcmToken) throw new Error('FCM token is required');

        const Model = userType === 'client' ? Client : User;
        
        // Avoid duplicate tokens — addToSet handles it
        const updatedDoc = await Model.findByIdAndUpdate(userId, {
            $addToSet: { fcmTokens: fcmToken },
        }, { new: true });
        
        if (updatedDoc) {
            console.log(`[NotificationService] Token registered for ${userType} ${updatedDoc.email || updatedDoc.phone}. Tokens: ${updatedDoc.fcmTokens.length}`);
        } else {
            console.warn(`[NotificationService] FAILED to find ${userType} ${userId} for token registration!`);
        }

        return { success: !!updatedDoc };
    }

    /**
     * Remove FCM token (on logout)
     */
    /**
     * Send WhatsApp Template Notification
     * @param {Object} params - { phone, template, values }
     */
    async sendWhatsAppTemplate({ phone, template, values, tenantId }) {
        if (!phone) return { success: false, message: 'Phone number required' };
        
        // Clean phone number (remove spaces, +, etc.)
        const cleanPhone = String(phone).replace(/\D/g, '');
        
        try {
            const result = await whatsappService.sendTemplateMessage(cleanPhone, template, values);
            
            // Increment usage if tenantId provided
            if (tenantId && result.success && !result.simulated) {
                const Tenant = (await import('../tenant/tenant.model.js')).default;
                await Tenant.findByIdAndUpdate(tenantId, { $inc: { whatsappUsed: 1 } });
            }
            
            return result;
        } catch (error) {
            console.error(`[NotificationService] WhatsApp Template Error:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send Simple WhatsApp Text
     */
    async sendWhatsAppText({ phone, text, tenantId }) {
        if (!phone) return { success: false, message: 'Phone number required' };
        const cleanPhone = String(phone).replace(/\D/g, '');

        try {
            const result = await whatsappService.sendTextMessage(cleanPhone, text);
            return result;
        } catch (error) {
            console.error(`[NotificationService] WhatsApp Text Error:`, error.message);
            return { success: false };
        }
    }
}

export default new NotificationService();
