import mongoose from 'mongoose';
import Booking from './booking.model.js';
import bookingRepository from './booking.repository.js';
import loyaltyService from '../loyalty/loyalty.service.js';
import notificationService from '../notification/notification.service.js';
import User from '../user/user.model.js';
import Outlet from '../outlet/outlet.model.js';

class BookingService {
    /**
     * Create a new booking
     */
    async createBooking(tenantId, bookingData) {
        const { staffId, appointmentDate, duration } = bookingData;

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

        // 2. Check for overlapping bookings for the same chair
        if (bookingData.chairId) {
            const chairOverlapping = await Booking.findOne({
                tenantId,
                outletId: bookingData.outletId,
                chairId: bookingData.chairId,
                status: { $in: ['pending', 'confirmed', 'arrived', 'in-progress'] },
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

            if (chairOverlapping) {
                throw new Error('This chair is already occupied or reserved for this time slot');
            }
        }

        const booking = await bookingRepository.create({ ...bookingData, tenantId });

        if (booking?.clientId) {
            await loyaltyService.handleReferralEvent(tenantId, booking.clientId, 'FIRST_SERVICE');
        }

        // --- Notifications ---
        try {
            // Populate necessary fields for notification message
            const populated = await booking.populate(['clientId', 'staffId', 'serviceId']);
            const clientName = populated.clientId?.name || 'A client';
            const serviceName = populated.serviceId?.name || 'service';
            
            // 1. Notify Assigned Stylist
            if (populated.staffId && (populated.staffId._id || populated.staffId.id)) {
                await notificationService.sendNotification({
                    recipientId: populated.staffId._id || populated.staffId.id,
                    tenantId,
                    type: 'booking_new',
                    title: 'New Appointment!',
                    body: `${clientName} booked ${serviceName} for ${new Date(populated.appointmentDate).toLocaleString()}`,
                    actionUrl: '/stylist/bookings',
                    data: { bookingId: booking._id.toString() }
                });
            }

            // 2. Notify Admin/Manager of the salon
            await notificationService.sendToRole(tenantId, 'admin', {
                type: 'booking_new',
                title: 'New Booking Received',
                body: `${clientName} booked with ${populated.staffId?.name || 'Unassigned'}`,
                actionUrl: '/admin/bookings',
                data: { bookingId: booking._id.toString() }
            });
        } catch (error) {
            console.warn('[BookingService] Notification failed:', error.message);
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

        // --- Notifications ---
        try {
            const populated = await booking.populate(['clientId', 'staffId']);
            const clientName = populated.clientId?.name || 'Client';

            if (status === 'confirmed') {
                // Notify Client
                if (populated.clientId) {
                    await notificationService.sendNotification({
                        recipientId: populated.clientId._id,
                        recipientType: 'client',
                        tenantId,
                        type: 'booking_confirmed',
                        title: 'Appointment Confirmed',
                        body: `Your booking for ${new Date(populated.appointmentDate).toLocaleDateString()} is confirmed!`,
                        actionUrl: '/app/bookings'
                    });
                }
            } else if (status === 'cancelled') {
                // Notify Staff and Admin
                const msg = {
                    type: 'booking_cancelled',
                    title: 'Appointment Cancelled',
                    body: `The booking for ${clientName} has been cancelled.`,
                    actionUrl: '/admin/bookings'
                };
                
                if (populated.staffId) {
                    await notificationService.sendNotification({
                        recipientId: populated.staffId._id,
                        tenantId,
                        type: 'booking_cancelled',
                        title: 'Booking Cancelled',
                        body: `Your appointment with ${clientName} was cancelled.`,
                        actionUrl: '/stylist/bookings'
                    });
                }
                
                await notificationService.sendToRole(tenantId, 'admin', msg);
            }
        } catch (error) {
            console.warn('[BookingService] Status notification failed:', error.message);
        }

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

    /**
     * Get availability for an outlet on a specific date
     */
    async getOutletAvailability(tenantId, outletId, date, duration = 30) {
        const startDay = new Date(date);
        startDay.setHours(0, 0, 0, 0);
        const endDay = new Date(date);
        endDay.setHours(23, 59, 59, 999);

        // 1. Get all staff for this outlet
        const staff = await User.find({ tenantId, outletId, role: 'stylist', status: 'active' }).select('name').lean();
        
        // 2. Get the outlet to see its chairs
        const outlet = await Outlet.findOne({ _id: outletId, tenantId }).select('chairs').lean();
        const chairs = outlet?.chairs || [];

        // 3. Get all bookings for this day
        const bookings = await Booking.find({
            tenantId,
            outletId,
            appointmentDate: { $gte: startDay, $lte: endDay },
            status: { $in: ['pending', 'confirmed', 'arrived', 'in-progress'] }
        }).lean();

        return {
            date,
            staff,
            chairs,
            bookings: bookings.map(b => ({
                id: b._id,
                staffId: b.staffId,
                chairId: b.chairId,
                start: b.appointmentDate,
                end: new Date(new Date(b.appointmentDate).getTime() + b.duration * 60000)
            }))
        };
    }
}

export default new BookingService();
