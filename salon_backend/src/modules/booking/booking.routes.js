import express from 'express';
import bookingController from './booking.controller.js';
import auth from '../../middlewares/auth.js';
import role from '../../middlewares/role.js';
import validateTenant from '../../middlewares/tenant.js';

const router = express.Router();

// All booking routes require authentication and tenant validation
router.use(auth);
router.use(validateTenant);

/**
 * Middleware to skip parametric routes if ID is NOT a 24-char ObjectId.
 * This prevents shadowing literal routes like /approvals.
 */
const validateBookingId = (req, res, next) => {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.bookingId)) {
        return next('route');
    }
    next();
};

// 1. Literal Routes (Priority)
router.get('/approvals', role(['admin', 'manager']), bookingController.getPendingApprovals);
router.get('/availability', bookingController.getAvailability);

// 2. Payment Routes
router.post('/payment/order', role(['customer']), bookingController.createPaymentOrder);
router.post('/payment/verify', role(['customer']), bookingController.verifyBookingPayment);

// 3. Base Collection Routes
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getBookings);

// 4. Parametric Routes (Must come after literals or use validation)
router.get('/:bookingId', validateBookingId, bookingController.getBooking);
router.patch('/:bookingId', validateBookingId, bookingController.updateBookingStatus);
router.patch('/:bookingId/approve', validateBookingId, role(['admin', 'manager']), bookingController.approveService);

export default router;
