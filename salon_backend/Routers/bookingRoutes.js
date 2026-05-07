const express = require('express');
const router = express.Router();
const {
    getBookings,
    createBooking,
    updateStatus,
    getAvailability,
    getAvailableSlots,
    createPaymentOrder,
    verifyPayment
} = require('../Controllers/bookingController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);

router.post('/payment/order', createPaymentOrder);
router.post('/payment/verify', verifyPayment);

router
    .route('/')
    .get(getBookings)
    .post(authorize('admin', 'manager', 'receptionist', 'customer'), createBooking);

router.get('/availability', getAvailability);
router.get('/available-slots', getAvailableSlots);

router
    .route('/:id/status')
    .patch(authorize('admin', 'manager', 'receptionist'), updateStatus);

const { getCustomerBookings, getBookingDetails } = require('../Controllers/bookingController');
router.get('/customer/:customerId', getCustomerBookings);
router.get('/details/:bookingId', getBookingDetails);

module.exports = router;
