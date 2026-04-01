import httpStatus from 'http-status-codes';
import notificationService from './notification.service.js';

/**
 * Register FCM token
 * POST /notifications/register-token
 */
const registerToken = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { fcmToken } = req.body;
        console.log(`[NotificationController] Registering token for user ${userId}: ${fcmToken?.substring(0, 10)}...`);
        const result = await notificationService.registerToken(userId, fcmToken);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Remove FCM token (on logout)
 * POST /notifications/remove-token
 */
const removeToken = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { fcmToken } = req.body;
        const result = await notificationService.removeToken(userId, fcmToken);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's notifications (paginated)
 * GET /notifications
 */
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { page = 1, limit = 20, unreadOnly } = req.query;
        const result = await notificationService.getNotifications(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            unreadOnly: unreadOnly === 'true',
        });
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get unread count
 * GET /notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const result = await notificationService.getUnreadCount(userId);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Mark specific notifications as read
 * PATCH /notifications/read
 */
const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { notificationIds } = req.body;
        const result = await notificationService.markAsRead(userId, notificationIds);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Mark all notifications as read
 * PATCH /notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const result = await notificationService.markAllAsRead(userId);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a notification
 * DELETE /notifications/:id
 */
const deleteNotification = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const result = await notificationService.deleteNotification(userId, req.params.id);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        next(error);
    }
};

export default {
    registerToken,
    removeToken,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
