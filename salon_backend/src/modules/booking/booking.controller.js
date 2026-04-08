import httpStatus from 'http-status-codes';
import bookingService from './booking.service.js';
import razorpayService from '../billing/razorpay.service.js';
import Booking from './booking.model.js';
import notificationService from '../notification/notification.service.js';

const createBooking = async (req, res, next) => {
    try {
        console.log('=========================================');
        console.log('[BOOKING-TRIGGER] NEW BOOKING REQUEST RECEIVED');
        console.log('TENANT:', req.tenantId);
        console.log('CLIENT:', req.body.clientId);
        console.log('SERVICE:', req.body.serviceId);
        console.log('=========================================');

        const booking = await bookingService.createBooking(req.tenantId, req.body);
        
        // Notify Admins/Managers about the new booking
        if (req.user?.role === 'customer') {
            notificationService.sendToRole(req.tenantId, 'manager', {
                type: 'new_booking',
                title: 'New Appointment Booked',
                body: `New booking for ${new Date(booking.appointmentDate).toLocaleDateString()}. Customer: ${req.user.name || 'Client'}`,
                actionUrl: `/manager/bookings/${booking._id}`,
            }).catch(err => console.error('[BookingNotification] New booking alert error:', err));
        }

        res.status(httpStatus.CREATED).send(booking);
    } catch (error) {
        console.group('[BookingController] Create Failure');
        console.error('Type:', error.name);
        console.error('Message:', error.message);
        if (error.name === 'CastError') {
            console.error('Path:', error.path);
            console.error('Value Received:', `[${error.value}]`);
            console.error('Value Type:', typeof error.value);
        }
        if (error.errors) {
            console.error('Validation Errors:', Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`));
        }
        console.groupEnd();
        next(error);
    }
};

const getBookings = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.staffId) filter.staffId = req.query.staffId;
        if (req.query.clientId) filter.clientId = req.query.clientId;
        if (req.query.outletId) filter.outletId = req.query.outletId;

        // Enforcement for receptionists
        if (req.user?.role === 'receptionist' && req.user.outletId) {
            filter.$or = [
                { outletId: req.user.outletId },
                { outletId: { $exists: false } },
                { outletId: null }
            ];
        }

        // Enforcement for customers (only show their own bookings)
        if (req.user?.role === 'customer') {
            filter.clientId = req.user._id;
        }

        // Enforcement for stylists (only show their own bookings)
        if (req.user?.role === 'stylist') {
            filter.staffId = req.user._id;
        }

        // Date filtering
        if (req.query.date) {
            // Expand range slightly to capture bookings that might shift due to timezone offsets
            // from UTC midnight. Typically -12 to +36 hours from UTC start of date.
            const startOfDay = new Date(req.query.date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            startOfDay.setHours(startOfDay.getHours() - 6); // Buffer for early morning local time

            const endOfDay = new Date(req.query.date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            endOfDay.setHours(endOfDay.getHours() + 6); // Buffer for late night local time
            
            filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
        }

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            populate: ['clientId', 'serviceId', 'staffId']
        };

        const result = await bookingService.queryBookings(req.tenantId, filter, options);
        res.send(result);
    } catch (error) {
        next(error);
    }
};

const getBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.getBookingById(req.tenantId, req.params.bookingId);
        res.send(booking);
    } catch (error) {
        next(error);
    }
};

const updateBookingStatus = async (req, res, next) => {
    try {
        if (req.user?.role === 'stylist') {
            const existing = await bookingService.getBookingById(req.tenantId, req.params.bookingId);
            const sid = req.user._id?.toString?.() || req.user.id?.toString?.();
            const staff = existing?.staffId?._id?.toString?.() || existing?.staffId?.toString?.();
            if (!existing || (staff && staff !== sid)) {
                return res.status(httpStatus.FORBIDDEN).send({ message: 'You can only update your own bookings' });
            }
        }
        const booking = await bookingService.updateBookingStatus(
            req.tenantId,
            req.params.bookingId,
            req.body.status
        );

        // Notify Customer about status change
        if (booking.clientId) {
            const statusLabels = {
                confirmed: 'Confirmed',
                cancelled: 'Cancelled',
                completed: 'Completed',
                'in-progress': 'Started',
            };
            notificationService.sendNotification({
                recipientId: booking.clientId._id || booking.clientId,
                recipientType: 'client',
                tenantId: req.tenantId,
                type: 'booking_update',
                title: `Booking ${statusLabels[req.body.status] || req.body.status}`,
                body: `Your appointment status has been updated to: ${statusLabels[req.body.status] || req.body.status}`,
                actionUrl: '/app/bookings',
            }).catch(err => console.error('[BookingNotification] Customer update error:', err));
        }

        res.send(booking);
    } catch (error) {
        console.error('[BookingController] updateBookingStatus error:', error);
        next(error);
    }
};

const getAvailability = async (req, res, next) => {
    try {
        const { outletId, date } = req.query;
        if (!outletId || !date) {
            return res.status(httpStatus.BAD_REQUEST).send({ message: 'outletId and date are required' });
        }
        const data = await bookingService.getOutletAvailability(req.tenantId, outletId, date);
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const createPaymentOrder = async (req, res, next) => {
    try {
        const { amount, receipt } = req.body;
        const order = await razorpayService.createOrder(amount, 'INR', receipt);
        res.status(httpStatus.CREATED).send(order);
    } catch (error) {
        next(error);
    }
};

const verifyBookingPayment = async (req, res, next) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

        const isValid = razorpayService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (!isValid) {
            return res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid payment signature' });
        }

        // Update booking if bookingId is provided (for post-booking payment)
        if (bookingId) {
            const booking = await Booking.findOne({ _id: bookingId, tenantId: req.tenantId });
            if (booking) {
                booking.status = 'confirmed';
                booking.paymentStatus = 'paid';
                booking.razorpayOrderId = razorpayOrderId;
                booking.razorpayPaymentId = razorpayPaymentId;
                await booking.save();

                // Notify Customer about successful confirmation
                if (booking.clientId) {
                    notificationService.sendNotification({
                        recipientId: booking.clientId,
                        recipientType: 'client',
                        tenantId: req.tenantId,
                        type: 'payment_success',
                        title: 'Booking Confirmed!',
                        body: 'Your payment was successful and your appointment is now confirmed.',
                        actionUrl: '/app/bookings',
                    }).catch(err => console.error('[BookingNotification] Payment confirm alert error:', err));

                    // WhatsApp Implementation
                    const populated = await Booking.findById(booking._id).populate(['clientId', 'serviceId']);
                    if (populated.clientId?.phone) {
                        notificationService.sendWhatsAppTemplate({
                            phone: populated.clientId.phone,
                            template: 'payment_success',
                            values: [
                                populated.clientId.name || 'Customer',
                                booking.price || 0,
                                populated.serviceId?.name || 'Service',
                                booking._id.toString().slice(-6).toUpperCase()
                            ],
                            tenantId: req.tenantId
                        }).catch(err => console.error('[WHATSAPP-ERROR] Payment success alert error:', err.message));
                    }
                }
            }
        }

        res.send({ success: true });
    } catch (error) {
        next(error);
    }
};

const getPendingApprovals = async (req, res, next) => {
    try {
        const bookings = await bookingService.getPendingApprovals(req.tenantId);
        res.send(bookings);
    } catch (error) {
        console.error('[BookingController] getPendingApprovals error:', error);
        next(error);
    }
};

const approveService = async (req, res, next) => {
    try {
        const booking = await bookingService.approveBooking(
            req.tenantId,
            req.params.bookingId,
            req.user._id
        );

        // Notify Customer about approval
        if (booking.clientId) {
            notificationService.sendNotification({
                recipientId: booking.clientId._id || booking.clientId,
                recipientType: 'client',
                tenantId: req.tenantId,
                type: 'service_approved',
                title: 'Service Approved',
                body: 'Your requested service has been approved by the salon.',
                actionUrl: '/app/bookings',
            }).catch(err => console.error('[BookingNotification] Approval alert error:', err));
        }

        res.send(booking);
    } catch (error) {
        console.error('[BookingController] approveService error:', error);
        next(error);
    }
};

export default {
    createBooking,
    getBookings,
    getBooking,
    updateBookingStatus,
    getAvailability,
    createPaymentOrder,
    verifyBookingPayment,
    getPendingApprovals,
    approveService,
};
