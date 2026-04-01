import express from 'express';
import notificationController from './notification.controller.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Token management
router.post('/register-token', notificationController.registerToken);
router.post('/remove-token', notificationController.removeToken);

// Notification list & actions
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);

// Temporary TEST route (Cleaned up for reliability)
router.get('/test', async (req, res, next) => {
    console.info('[Notification] Incoming test request from user:', req.user?._id);
    try {
        const User = (await import('../user/user.model.js')).default;
        const notificationService = (await import('./notification.service.js')).default;
        
        // Target specifically the requesting user first for high-speed test
        const targetUserId = req.user?._id;
        if (!targetUserId) {
            return res.status(400).send({ message: 'User not authenticated for test' });
        }

        console.info('[Notification] Sending test push to current user:', targetUserId);
        
        await notificationService.sendNotification({
            recipientId: targetUserId,
            type: 'general',
            title: 'Immediate Test 🚀',
            body: 'Aapka push notification system Live hai!',
            actionUrl: '/superadmin'
        });

        res.send({ success: true, message: 'Test push sent to your ID!' });
    } catch (err) {
        console.error('[Notification] Test route failure:', err.message);
        res.status(500).send({ success: false, error: err.message });
    }
});

router.patch('/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
