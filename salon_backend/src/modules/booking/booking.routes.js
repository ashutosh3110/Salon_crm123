import express from 'express';
import bookingController from './booking.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';

const router = express.Router();

// All booking routes require authentication and tenant validation
router.use(auth);
router.use(validateTenant);

router
    .route('/')
    .post(bookingController.createBooking)
    .get(bookingController.getBookings);

router
    .route('/:bookingId')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBookingStatus);

export default router;
