import mongoose from 'mongoose';
import Booking from './booking.model.js';
import bookingRepository from './booking.repository.js';
import loyaltyService from '../loyalty/loyalty.service.js';
import notificationService from '../notification/notification.service.js';
import User from '../user/user.model.js';
import Outlet from '../outlet/outlet.model.js';
import Service from '../service/service.model.js';
import Commission from '../hr/commission.model.js';

class BookingService {
    async createBooking(tenantId, bookingData) {
        if (!bookingData || Object.keys(bookingData).length === 0) {
            console.error('[BookingService] createBooking called with empty body. tenantId:', tenantId);
            throw new Error('Booking data is required');
        }

        // --- EXTREME LOGGING ---
        console.log('[DEBUG] createBooking Entry Point');
        console.log('[DEBUG] tenantId:', tenantId);
        console.log('[DEBUG] bookingData Keys:', Object.keys(bookingData));

        // Inline Sanitization (Avoid 'this' issues)
        const toId = (val, name) => {
            if (!val) {
                console.error(`[DEBUG] Missing ID for field: ${name}`);
                return null;
            }
            const str = String(val).trim();
            if (!mongoose.Types.ObjectId.isValid(str)) {
                console.error(`[DEBUG] Invalid ID for field ${name}: [${str}]`);
                return null;
            }
            return new mongoose.Types.ObjectId(str);
        };

        const s_tenantId = toId(tenantId, 'tenantId');
        const s_clientId = toId(bookingData.clientId, 'clientId');
        const s_serviceId = toId(bookingData.serviceId, 'serviceId');
        const s_staffId = toId(bookingData.staffId, 'staffId');
        const s_outletId = toId(bookingData.outletId, 'outletId');

        if (!s_tenantId || !s_clientId || !s_serviceId || !s_staffId || !s_outletId) {
            const missing = [];
            if (!s_tenantId) missing.push('tenantId');
            if (!s_clientId) missing.push('clientId');
            if (!s_serviceId) missing.push('serviceId');
            if (!s_staffId) missing.push('staffId');
            if (!s_outletId) missing.push('outletId');
            throw new Error(`Sanitization failed: ${missing.join(', ')}`);
        }

        const appointmentDate = new Date(bookingData.appointmentDate);
        const duration = Number(bookingData.duration) || 30;

        // 1. Check for overlapping bookings for the same staff
        const start = new Date(appointmentDate);
        const end = new Date(start.getTime() + duration * 60000);

        const overlapping = await Booking.findOne({
            tenantId: s_tenantId,
            staffId: s_staffId,
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
            throw new Error('Stylist is already booked for this slot');
        }
        
        console.log('[DEBUG] No overlap. Construction Manual Document...');

        // 2. Direct Mongoose Document
        const booking = new Booking({
            tenantId: s_tenantId,
            clientId: s_clientId,
            serviceId: s_serviceId,
            staffId: s_staffId,
            outletId: s_outletId,
            appointmentDate: start,
            duration,
            price: Number(bookingData.price) || 0,
            time: bookingData.time,
            notes: bookingData.notes,
            paymentStatus: bookingData.paymentStatus || 'unpaid',
            paymentMethod: bookingData.paymentMethod || 'salon',
            status: 'confirmed'
        });

        console.log('[DEBUG] Final Document BEFORE Save:', JSON.stringify(booking.toObject()));
        
        await booking.save();
        console.log('[DEBUG] Save Success! ID:', booking._id);

        // 3. Post-Save Operations (Non-blocking for the response)
        try {
            if (booking?.clientId) {
                // Loyalty and referrals
                loyaltyService.handleReferralEvent(s_tenantId, booking.clientId, 'FIRST_SERVICE').catch(err => {
                    console.warn('[BookingService] Loyalty event failed (silent):', err.message);
                });
            }

            // --- Notifications (Fire and Forget) ---
            (async () => {
                try {
                    const populated = await Booking.findById(booking._id).populate(['clientId', 'staffId', 'serviceId']);
                    if (!populated) return;

                    const clientName = populated.clientId?.name || 'A client';
                    const serviceName = populated.serviceId?.name || 'service';
                    
                    if (populated.staffId) {
                        await notificationService.sendNotification({
                            recipientId: populated.staffId._id,
                            tenantId: s_tenantId,
                            type: 'booking_new',
                            title: 'New Appointment!',
                            body: `${clientName} booked ${serviceName} for ${new Date(populated.appointmentDate).toLocaleString()}`,
                            data: { bookingId: booking._id.toString() }
                        });
                    }

                    await notificationService.sendToRole(s_tenantId, 'admin', {
                        type: 'booking_new',
                        title: 'New Booking Received',
                        body: `${clientName} booked with ${populated.staffId?.name || 'Unassigned'}`,
                        data: { bookingId: booking._id.toString() }
                    });

                    // --- WhatsApp Placeholder for Client ---
                    if (populated.clientId?.phone) {
                        await notificationService.sendWhatsAppTemplate({
                            phone: populated.clientId.phone,
                            tenantId: s_tenantId,
                            template: process.env.WHATSAPP_TEMPLATE_BOOKING_LINK || 'booking_update',
                            values: [
                                clientName, 
                                serviceName, 
                                booking._id.toString(), 
                                new Date(populated.appointmentDate).toLocaleString()
                            ]
                        });
                    }
                } catch (internalErr) {
                    console.warn('[BookingService] Async notification failed:', internalErr.message);
                }
            })();
        } catch (outerErr) {
            console.warn('[BookingService] Post-save hooks failed:', outerErr.message);
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
        const booking = await Booking.findOne({ _id: bookingId, tenantId });
        if (!booking) {
            throw new Error('Booking not found');
        }

        booking.status = status;
        console.log(`[BookingService] saving booking ${bookingId} with status ${status}`);
        await booking.save();
        console.log(`[BookingService] booking ${bookingId} saved successfully`);

        // --- Notifications ---
        try {
            const populated = await Booking.findById(booking._id).populate(['clientId', 'staffId']);
            if (!populated) return booking; // Fallback if record lost

            const clientName = populated.clientId?.name || 'Client';

            if (status === 'confirmed') {
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

                // --- WhatsApp Confirmation for Client ---
                if (populated.clientId?.phone) {
                    await notificationService.sendWhatsAppTemplate({
                        phone: populated.clientId.phone,
                        tenantId,
                        template: process.env.WHATSAPP_TEMPLATE_BOOKING_LINK || 'booking_update',
                        values: [
                            clientName, 
                            populated.serviceId?.name || 'Service', 
                            bookingId.toString(), 
                            new Date(populated.appointmentDate).toLocaleString()
                        ]
                    });
                }
            } else if (status === 'cancelled') {
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

                // --- WhatsApp Cancellation for Client ---
                if (populated.clientId?.phone) {
                    await notificationService.sendWhatsAppTemplate({
                        phone: populated.clientId.phone,
                        tenantId,
                        template: 'booking_cancelled',
                        values: [clientName, new Date(populated.appointmentDate).toLocaleDateString()]
                    });
                }
            }
        } catch (error) {
            console.error('[BookingService] Status notification failed:', error);
        }

        return booking;
    }

    /**
     * Get booking details
     */
    async getBookingById(tenantId, bookingId) {
        const booking = await Booking.findOne({ _id: bookingId, tenantId })
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

    /**
     * Get bookings pending manager approval
     */
    async getPendingApprovals(tenantId) {
        try {
            if (!tenantId) {
                console.warn('[BookingService] getPendingApprovals called without tenantId');
                return [];
            }
            console.log(`[BookingService] fetching pending approvals for tenant: ${tenantId}`);
            const query = {
                tenantId,
                status: 'completed',
                isApprovedByManager: { $ne: true }
            };
            const bookings = await Booking.find(query)
                .populate('clientId', 'name phone')
                .populate('serviceId', 'name price category')
                .populate('staffId', 'name role')
                .sort({ updatedAt: -1 });

            console.log(`[BookingService] Found ${bookings.length} pending approvals`);
            return bookings;
        } catch (error) {
            console.error('[BookingService] getPendingApprovals fatal error:', error);
            throw error;
        }
    }

    /**
     * Approve a service and create commission
     */
    async approveBooking(tenantId, bookingId, managerId) {
        try {
            const booking = await Booking.findOne({ _id: bookingId, tenantId });
            if (!booking) throw new Error('Booking not found');
            if (booking.status !== 'completed') throw new Error('Booking must be completed before approval');
            if (booking.isApprovedByManager) throw new Error('Booking already approved');

            const service = await Service.findOne({ _id: booking.serviceId, tenantId });
            if (!service) throw new Error('Service not found');

            // 1. Calculate Commission
            let commissionAmount = 0;
            if (service.commissionApplicable) {
                commissionAmount = service.commissionType === 'percent' 
                    ? (booking.price * service.commissionValue) / 100 
                    : service.commissionValue;
            }

            // 2. Create Commission Record
            await Commission.create({
                tenantId,
                staffId: booking.staffId,
                serviceId: booking.serviceId,
                amount: commissionAmount,
                baseAmount: booking.price,
                percentage: service.commissionType === 'percent' ? service.commissionValue : null,
                status: 'pending'
            });

            // 3. Mark Booking as Approved
            booking.isApprovedByManager = true;
            booking.approvedAt = new Date();
            booking.approvedBy = managerId;
            await booking.save();

            return booking;
        } catch (error) {
            console.error('[BookingService] approveBooking fatal error:', error);
            throw error;
        }
    }
}

export default new BookingService();
