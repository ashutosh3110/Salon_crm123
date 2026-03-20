import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { reminderLinkValidation } from '../../validations/index.js';
import reminderLinkController from './reminderLink.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);
router.use(authorize(['admin', 'manager', 'receptionist']));

router.get('/state', reminderLinkController.getState);
router.post('/bridal-bookings', validate(reminderLinkValidation.addBridalBooking), reminderLinkController.addBridalBooking);
router.patch('/bridal-bookings/:bookingId', validate(reminderLinkValidation.updateBridalBooking), reminderLinkController.updateBridalBooking);
router.delete('/bridal-bookings/:bookingId', reminderLinkController.deleteBridalBooking);
router.patch('/bridal-bookings/:bookingId/reminders/:reminderId/toggle', reminderLinkController.toggleBridalReminder);

router.post('/rules', validate(reminderLinkValidation.addRule), reminderLinkController.addRule);
router.patch('/rules/:ruleId', validate(reminderLinkValidation.updateRule), reminderLinkController.updateRule);
router.delete('/rules/:ruleId', reminderLinkController.deleteRule);

router.patch('/settings', validate(reminderLinkValidation.updateSettings), reminderLinkController.updateSettings);

router.post('/process-event-reminders', reminderLinkController.processDueEventReminders);
router.post('/social-share/whatsapp', validate(reminderLinkValidation.socialShareWhatsApp), reminderLinkController.broadcastBookingLinkWhatsApp);
router.get('/service-signals/pending', reminderLinkController.getPendingServiceSignals);
router.post('/service-signals/mark-replied', validate(reminderLinkValidation.markServiceSignalReplied), reminderLinkController.markServiceSignalReplied);
router.post('/service-signals/send-whatsapp', validate(reminderLinkValidation.sendServiceSignalWhatsApp), reminderLinkController.sendServiceReminderWhatsApp);

export default router;
