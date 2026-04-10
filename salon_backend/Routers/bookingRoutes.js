const express = require('express');
const router = express.Router();
const {
    getBookings,
    createBooking,
    updateStatus
} = require('../Controllers/bookingController');
const { protect, authorize } = require('../Middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getBookings)
    .post(authorize('admin', 'manager', 'receptionist'), createBooking);

router
    .route('/:id/status')
    .patch(authorize('admin', 'manager', 'receptionist'), updateStatus);

module.exports = router;
