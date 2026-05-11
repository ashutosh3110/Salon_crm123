const express = require('express');
const router = express.Router();
const { 
    getState, 
    addRule, 
    updateRule, 
    addBridalBooking, 
    toggleBridalReminder,
    getPendingSignals,
    updateSettings
} = require('../Controllers/reminderLinkController');
const { protect } = require('../Middleware/auth');

router.use(protect);

router.get('/state', getState);
router.post('/rules', addRule);
router.patch('/rules/:id', updateRule);
router.post('/bridal-bookings', addBridalBooking);
router.patch('/bridal-bookings/:bookingId/reminders/:remId/toggle', toggleBridalReminder);
router.get('/service-signals/pending', getPendingSignals);
router.patch('/settings', updateSettings);

module.exports = router;
