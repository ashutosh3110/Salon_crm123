const express = require('express');
const router = express.Router();
const { getReminders, updateReminder } = require('../Controllers/serviceReminderController');
const { protect } = require('../Middleware/auth');

router.get('/', protect, getReminders);
router.patch('/:id', protect, updateReminder);

module.exports = router;
