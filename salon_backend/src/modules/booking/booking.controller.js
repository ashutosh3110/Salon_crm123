import httpStatus from 'http-status-codes';
import bookingService from './booking.service.js';

const createBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.createBooking(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(booking);
    } catch (error) {
        next(error);
    }
};

const getBookings = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.staffId) filter.staffId = req.query.staffId;
        if (req.query.clientId) filter.clientId = req.query.clientId;

        // Date filtering
        if (req.query.date) {
            const startOfDay = new Date(req.query.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(req.query.date);
            endOfDay.setHours(23, 59, 59, 999);
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
        const booking = await bookingService.updateBookingStatus(
            req.tenantId,
            req.params.bookingId,
            req.body.status
        );
        res.send(booking);
    } catch (error) {
        next(error);
    }
};

export default {
    createBooking,
    getBookings,
    getBooking,
    updateBookingStatus,
};
