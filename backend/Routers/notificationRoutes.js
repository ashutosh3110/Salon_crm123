const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, sendManualNotification, registerToken } = require('../Controllers/notificationController');
const { protect } = require('../Middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/send', sendManualNotification);
router.post('/register-token', registerToken);

module.exports = router;
