import bookingRepository from './booking.repository.js';
import Booking from './booking.model.js';
import User from '../user/user.model.js';
import loyaltyService from '../loyalty/loyalty.service.js';

class BookingService {
    /**
     * Create a new booking
     */
    async createBooking(tenantId, bookingData) {
        const { staffId, appointmentDate, duration, outletId } = bookingData;

        // 1. Check for overlapping bookings for the same staff
        const start = new Date(appointmentDate);
        const end = new Date(start.getTime() + duration * 60000);

        const overlapping = await Booking.findOne({
            tenantId,
            staffId,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                {
                    appointmentDate: { $lt: end },
                    $expr: {
                        $gt: [
                            { $add: ["$appointmentDate", { $multiply: ["$duration", 60000] }] },
                            start
                        ]
                    }
                }
            ]
        });

        if (overlapping) {
            throw new Error('Stylist is already booked for this time slot');
        }

        let finalOutletId = outletId;
        if (!finalOutletId && staffId) {
            const staff = await User.findById(staffId).select('outletId').lean();
            finalOutletId = staff?.outletId;
        }

        if (!finalOutletId) {
            throw new Error('Outlet ID is required for booking');
        }

        const booking = await bookingRepository.create({ ...bookingData, tenantId, outletId: finalOutletId });

        // If referral threshold is FIRST_SERVICE, reward on first successful booking creation.
        if (booking?.clientId) {
            await loyaltyService.handleReferralEvent(tenantId, booking.clientId, 'FIRST_SERVICE');
        }

        return booking;
    }

    /**
     * Get bookings with filters
     */
    async queryBookings(tenantId, filter, options) {
        return bookingRepository.find({ ...filter, tenantId }, options);
    }

    /**
     * Update booking status
     */
    async updateBookingStatus(tenantId, bookingId, status) {
        const booking = await bookingRepository.findOne({ _id: bookingId, tenantId });
        if (!booking) {
            throw new Error('Booking not found');
        }

        booking.status = status;
        await booking.save();
        return booking;
    }

    /**
     * Get booking details
     */
    async getBookingById(tenantId, bookingId) {
        const booking = await bookingRepository.findOne({ _id: bookingId, tenantId })
            .populate('clientId')
            .populate('serviceId')
            .populate('staffId', 'name email role');

        if (!booking) {
            throw new Error('Booking not found');
        }
        return booking;
    }
}

export default new BookingService();
