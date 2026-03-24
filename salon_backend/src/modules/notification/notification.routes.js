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

// Temporary TEST route (You can delete this later)
router.get('/test', async (req, res, next) => {
    try {
        const notificationService = (await import('./notification.service.js')).default;
        const User = (await import('../user/user.model.js')).default;
        const users = await User.find({ status: 'active' }).select('_id');
        const ids = users.map(u => u._id);
        
        await notificationService.sendToMany(ids, {
            type: 'general',
            title: 'Test Notification 🚀',
            body: 'Aapka push notification system sahi se kaam kar raha hai!',
            actionUrl: '/admin'
        });
        res.send({ message: `Sent to ${ids.length} users` });
    } catch (err) {
        next(err);
    }
});

router.patch('/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
