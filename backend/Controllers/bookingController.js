const mongoose = require('mongoose');
const Booking = require('../Models/Booking');
const { sendWapixoTemplate } = require('../Utils/whatsapp');
const { spendWallet } = require('../Utils/walletHelper');
const User = require('../Models/User');
const Service = require('../Models/Service');
const Customer = require('../Models/Customer');
const Salon = require('../Models/Salon');
const WalletTransaction = require('../Models/WalletTransaction');
const CustomerMembership = require('../Models/CustomerMembership');
const LoyaltyTransaction = require('../Models/LoyaltyTransaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Break = require('../Models/Break');
const Staff = require('../Models/Staff');
const Setting = require('../Models/Setting');
const { calculateTotals } = require('../Utils/billingCalc');

// Initialize Razorpay
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    console.warn('Razorpay keys are missing. Payment features in bookingController will not work.');
}


// @desc    Get all bookings for salon
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'customer') {
            filter = { clientId: req.user._id };
        } else {
            filter = { salonId: req.user.salonId };
        }

        const bookings = await Booking.find(filter)
            .populate('clientId', 'name phone email')
            .populate('serviceId', 'name price duration isInclusiveTax gst')
            .populate('staffId', 'name profileImage')
            .populate('outletId', 'name address city')
            .populate('salonId', 'name logo')
            .sort({ createdAt: -1 });

        // Transform for frontend compatibility
        const result = bookings.map(b => ({
            ...b._doc,
            client: b.clientId, 
            service: b.serviceId, 
            staff: b.staffId, 
            outlet: b.outletId,
            tenantId: b.salonId // Mapping salonId to tenantId as expected by frontend
        }));

        res.json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private (Admin/Manager/Receptionist/Customer)
exports.createBooking = async (req, res) => {
    try {
        const salonId = req.user.salonId || req.body.salonId || req.body.tenantId;
        if (!salonId) {
            return res.status(400).json({ success: false, message: 'Cannot identify salon for this booking' });
        }
        const { serviceId, paymentMethod, appointmentDate, source } = req.body;
        if (!serviceId) {
            return res.status(400).json({ success: false, message: 'Service is required' });
        }
        
        // Prevent booking in the past for app bookings
        if (source === 'APP' && new Date(appointmentDate) < new Date()) {
            return res.status(400).json({ success: false, message: 'Cannot book for a past time' });
        }
        
        // Fetch service to get price if not provided
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const targetCustomerId = req.body.clientId || req.user._id;
        const customer = await Customer.findById(targetCustomerId);
        if (!customer && req.body.clientId) {
             return res.status(404).json({ success: false, message: 'Target customer not found' });
        }

        // Fetch active membership to apply discount securely in backend
        const activeMembership = await CustomerMembership.findOne({
            customerId: targetCustomerId,
            status: 'active',
            expiryDate: { $gt: new Date() }
        }).populate('planId');

        // Calculate / Resolve Financials
        const bodySubtotal = Number(req.body.subtotal || 0);
        const bodyTax = Number(req.body.tax || 0);
        const bodyMembershipDiscount = Number(req.body.membershipDiscount || 0);
        const bodyPromoDiscount = Number(req.body.promoDiscount || 0);
        const bodyTotalPrice = Number(req.body.totalPrice || 0);

        let finalSubtotal, finalTax, finalMembershipDiscount, finalPromoDiscount, finalTotal;

        if (bodySubtotal > 0 || bodyTotalPrice > 0) {
            // Trust client-side calculation if provided (common for App/POS with complex logic)
            finalSubtotal = bodySubtotal || service.price;
            finalMembershipDiscount = bodyMembershipDiscount;
            finalPromoDiscount = bodyPromoDiscount;
            finalTax = bodyTax;
            finalTotal = bodyTotalPrice || (finalSubtotal - finalMembershipDiscount - finalPromoDiscount + finalTax);
        } else {
            // Legacy/Backend calculation fallback
            const settings = await Setting.findOne();
            const serviceGst = settings?.serviceGst || 5;

            const calc = calculateTotals({
                items: [{
                    type: 'service',
                    price: service.price,
                    quantity: 1,
                    isInclusiveTax: service.isInclusiveTax,
                    gstPercent: service.gst !== undefined ? service.gst : serviceGst
                }],
                activeMembership,
                serviceGstRate: serviceGst,
                productGstRate: settings?.productGst || 10,
                inclusiveTaxFallback: false
            });

            finalSubtotal = calc.subtotal;
            finalMembershipDiscount = calc.membershipDiscount;
            finalPromoDiscount = 0;
            finalTax = calc.tax;
            finalTotal = calc.total;
        }

        // Validate coupon code
        if (req.body.couponCode) {
            const Promotion = require('../Models/Promotion');
            const promo = await Promotion.findOne({
                isActive: true,
                couponCode: req.body.couponCode.trim().toUpperCase(),
                activationMode: 'COUPON',
                salonId
            });
            if (!promo) {
                return res.status(400).json({ success: false, message: 'Invalid coupon code' });
            }
            const now = new Date();
            if (promo.startDate && new Date(promo.startDate) > now) {
                return res.status(400).json({ success: false, message: 'Coupon is not active yet' });
            }
            if (promo.endDate && new Date(promo.endDate) < now) {
                return res.status(400).json({ success: false, message: 'Coupon has expired' });
            }
            if (promo.totalUsageLimit !== undefined && promo.usageCount >= promo.totalUsageLimit) {
                return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
            }
            if (promo.applicableOn === 'PRODUCT') {
                return res.status(400).json({ success: false, message: 'This coupon is only applicable on products' });
            }
            if (promo.usageLimitPerCustomer) {
                const code = promo.couponCode;
                const [bookingsCount, ordersCount, invoicesCount] = await Promise.all([
                    mongoose.model('Booking').countDocuments({ clientId: targetCustomerId, couponCode: code, status: { $ne: 'cancelled' } }),
                    mongoose.model('Order').countDocuments({ customerId: targetCustomerId, couponCode: code, status: { $ne: 'cancelled' } }),
                    mongoose.model('Invoice').countDocuments({ customerId: targetCustomerId, couponCode: code, status: { $ne: 'cancelled' } })
                ]);
                const totalCustomerUsage = bookingsCount + ordersCount + invoicesCount;
                if (totalCustomerUsage >= promo.usageLimitPerCustomer) {
                    return res.status(400).json({ success: false, message: 'You have already used this coupon code' });
                }
            }
        }

        // Handle Wallet Payment
        if (paymentMethod === 'Wallet' || paymentMethod === 'wallet') {
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }

            if ((customer.walletBalance || 0) < finalTotal) {
                return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
            }

            // Use wallet helper to spend balance
            await spendWallet(targetCustomerId, finalTotal, `Payment for service: ${service.name}`);
        }

        const booking = await Booking.create({
            ...req.body,
            salonId,
            subtotal: finalSubtotal,
            membershipDiscount: finalMembershipDiscount,
            promoDiscount: finalPromoDiscount,
            tax: finalTax,
            totalPrice: finalTotal,
            paymentStatus: (paymentMethod === 'Wallet' || paymentMethod === 'wallet') ? 'paid' : 'unpaid'
        });

        // Increment promotion usage count if couponCode is used
        if (req.body.couponCode) {
            try {
                const Promotion = require('../Models/Promotion');
                await Promotion.updateOne(
                    { couponCode: req.body.couponCode.trim().toUpperCase(), salonId },
                    { $inc: { usageCount: 1 } }
                );
            } catch (promoErr) {
                console.error('[Booking-Promo] Error incrementing usage count:', promoErr);
            }
        }

        // If booking is created as completed, update customer stats
        if (booking.status === 'completed') {
            await Customer.findByIdAndUpdate(targetCustomerId, {
                $inc: { 
                    totalVisits: 1,
                    totalSpend: totalPrice || 0
                },
                $set: {
                    lastVisit: booking.appointmentDate || new Date(),
                    lastOutletId: booking.outletId
                }
            });
        }

        const populated = await Booking.findById(booking._id)
            .populate('clientId', 'name phone email')
            .populate('serviceId', 'name price duration isInclusiveTax gst')
            .populate('staffId', 'name profileImage')
            .populate('outletId', 'name address city')
            .populate('salonId', 'name logo');

        // Send Booking Confirmation WhatsApp Message
        try {
            const dateStr = new Date(populated.appointmentDate).toLocaleDateString();
            const timeStr = populated.time || new Date(populated.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const { checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');
            const canSend = await checkAndDeductWhatsAppCredit(populated.outletId?._id || booking.outletId);

            if (canSend) {
                await sendWapixoTemplate(
                    populated.clientId.phone,
                    process.env.WHATSAPP_TEMPLATE_BOOKING_LINK,
                    [
                        populated.clientId.name,
                        populated.salonId.businessName || populated.salonId.name || 'Our Salon',
                        populated.outletId.name,
                        populated.outletId.city || populated.outletId.address?.city || 'Our Location',
                        populated.staffId?.name || 'Assigned Stylist',
                        populated.serviceId.name,
                        dateStr,
                        timeStr
                    ]
                );
            }
        } catch (wsErr) {
            console.error('Booking WhatsApp failed:', wsErr.message);
        }

        // Send Push Notification
        try {
            const { sendNotification, sendAdminNotification } = require('../Utils/notification');
            const dateStr = new Date(populated.appointmentDate).toLocaleDateString();
            const timeStr = populated.time || new Date(populated.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            await sendNotification({
                customerId: populated.clientId._id,
                salonId: populated.salonId._id,
                title: 'Booking Confirmed! 📅',
                message: `Hi ${populated.clientId.name}, your booking for ${populated.serviceId.name} at ${populated.salonId.name} on ${dateStr} at ${timeStr} is confirmed.`,
                type: 'booking',
                actionUrl: `/app/bookings/${populated._id}`,
                data: { bookingId: populated._id.toString() }
            });

            // Notify Admins if created by customer
            if (req.user?.role === 'customer' || source === 'APP' || source === 'WEB' || source === 'app' || source === 'web') {
                const { sendWhatsAppMessage } = require('../Utils/whatsapp');
                const User = require('../Models/User');

                const adminTitle = 'New Booking Alert! 🔔';
                const adminMsg = `New booking received from ${populated.clientId.name} for ${populated.serviceId.name} on ${dateStr} at ${timeStr}.`;

                await sendAdminNotification({
                    salonId,
                    title: adminTitle,
                    message: adminMsg,
                    type: 'booking',
                    actionUrl: `/admin/bookings/${populated._id}`
                });

                // WhatsApp to Admins
                const { checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');
                const canSendAdmin = await checkAndDeductWhatsAppCredit(populated.outletId?._id || booking.outletId);

                if (canSendAdmin) {
                    const admins = await User.find({ salonId, role: 'admin', status: 'active' });
                    for (const ad of admins) {
                        if (ad.phone) {
                            await sendWhatsAppMessage(ad.phone, adminMsg);
                        }
                    }
                }
            }
        } catch (pushErr) {
            console.error('Booking Notification failed:', pushErr.message);
        }

        res.status(201).json({
            success: true,
            data: {
                ...populated._doc,
                client: populated.clientId,
                service: populated.serviceId,
                staff: populated.staffId,
                outlet: populated.outletId,
                tenantId: populated.salonId
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private
exports.updateStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (req.user.role === 'customer') {
            if (booking.clientId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ success: false, message: 'Not authorized to modify this booking' });
            }
            // Customers can only change status to 'cancelled'
            if (req.body.status && req.body.status !== 'cancelled') {
                return res.status(400).json({ success: false, message: 'Customers are only permitted to cancel bookings' });
            }
            // Customers cannot change payment status
            if (req.body.paymentStatus) {
                return res.status(400).json({ success: false, message: 'Not authorized to modify payment status' });
            }
        } else {
            // Salon staff authorization
            if (booking.salonId.toString() !== req.user.salonId.toString()) {
                return res.status(401).json({ success: false, message: 'Not authorized for this salon' });
            }
        }

        const oldStatus = booking.status;
        if (req.body.status) booking.status = req.body.status;
        if (req.body.paymentStatus) booking.paymentStatus = req.body.paymentStatus;
        if (req.body.staffId) booking.staffId = req.body.staffId;
        if (req.body.notes !== undefined) booking.notes = req.body.notes;

        // Auto-complete payment for salon payments when booking is completed
        if (booking.status === 'completed' && booking.paymentMethod === 'salon') {
            booking.paymentStatus = 'paid';
        }

        // If status changed to completed, increment visits and spend
        if (booking.status === 'completed' && oldStatus !== 'completed') {
            await Customer.findByIdAndUpdate(booking.clientId, {
                $inc: { 
                    totalVisits: 1,
                    totalSpend: booking.totalPrice || 0
                },
                $set: {
                    lastVisit: booking.appointmentDate || new Date(),
                    lastOutletId: booking.outletId
                }
            });
        }

        await booking.save();

        // If status changed to completed, award loyalty points
        if (booking.status === 'completed' && oldStatus !== 'completed') {
            try {
                let points = 0;
                let hasServicePoints = false;
                
                const service = await Service.findById(booking.serviceId);
                if (service && service.loyaltyPoints) {
                    points = service.loyaltyPoints;
                    hasServicePoints = true;
                }
                
                if (!hasServicePoints) {
                    const settings = await Setting.findOne();
                    if (settings && settings.loyaltySettings && settings.loyaltySettings.active) {
                        const rate = settings.loyaltySettings.pointsRate || 100;
                        points = Math.floor(booking.totalPrice / rate);
                    }
                }
                
                if (points > 0) {
                    await Customer.findByIdAndUpdate(booking.clientId, {
                        $inc: { loyaltyPoints: points }
                    });

                    // Create Loyalty Transaction record
                    await LoyaltyTransaction.create({
                        customerId: booking.clientId,
                        salonId: booking.salonId,
                        amount: points,
                        type: 'EARN',
                        referenceId: booking._id,
                        source: 'BOOKING',
                        description: `Earned from Booking #${booking._id.toString().slice(-6).toUpperCase()}`
                    });
                }
            } catch (error) {
                console.error('Error awarding loyalty points:', error);
            }
        }

        // Send Unified Notifications (Firebase & WhatsApp)
        try {
            const { sendNotification, sendAdminNotification } = require('../Utils/notification');
            const { sendWhatsAppMessage, sendWapixoTemplate } = require('../Utils/whatsapp');
            const User = require('../Models/User');

            // Fetch fully populated booking for notifications
            const populated = await Booking.findById(booking._id)
                .populate('clientId', 'name phone email')
                .populate('serviceId', 'name price duration isInclusiveTax gst')
                .populate('staffId', 'name')
                .populate('outletId', 'name address city')
                .populate('salonId', 'name logo businessName');

            if (populated) {
                const statusMsgs = {
                    'completed': 'Your service is completed. We hope you enjoyed your ritual! ✨',
                    'cancelled': 'Your booking has been cancelled.',
                    'confirmed': 'Your booking has been confirmed by the salon. We look forward to seeing you! ✅',
                    'no-show': 'We missed you! Your booking was marked as a no-show.',
                    'rejected': 'Sorry, your booking has been rejected by the salon.'
                };

                const msg = statusMsgs[booking.status] || `Your booking status has been updated to ${booking.status}.`;
                const title = booking.status === 'confirmed' ? 'Booking Confirmed! 📅' : `Booking ${booking.status.toUpperCase()}!`;
                const clientName = populated.clientId?.name || 'Customer';

                // 1. Notify Customer (Firebase)
                await sendNotification({
                    customerId: booking.clientId,
                    salonId: booking.salonId,
                    title,
                    message: msg,
                    type: 'booking',
                    actionUrl: `/app/bookings/${booking._id}`,
                    data: { bookingId: booking._id.toString(), status: booking.status }
                });

                // 2. Notify Admins (Firebase)
                const adminMsg = `Booking #${booking._id.toString().slice(-6).toUpperCase()} for ${clientName} is now ${booking.status.toUpperCase()}.`;
                await sendAdminNotification({
                    salonId: booking.salonId,
                    title: `Booking Update: ${booking.status.toUpperCase()}`,
                    message: adminMsg,
                    type: 'booking',
                    actionUrl: `/admin/bookings`,
                    data: { bookingId: booking._id.toString(), status: booking.status }
                });

                // 3. WhatsApp Notifications
                const salonName = populated.salonId?.businessName || populated.salonId?.name || 'Our Salon';
                const { checkAndDeductWhatsAppCredit } = require('../Utils/whatsapp');
                
                // WhatsApp to Customer
                const canSendCustStatus = await checkAndDeductWhatsAppCredit(populated.outletId?._id || booking.outletId);
                if (canSendCustStatus && populated.clientId?.phone) {
                    if (booking.status === 'confirmed' && process.env.WHATSAPP_TEMPLATE_BOOKING_LINK) {
                        const dateStr = new Date(populated.appointmentDate).toLocaleDateString();
                        const timeStr = populated.time || new Date(populated.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const staffNames = Array.isArray(populated.staffId) ? populated.staffId.map(s => s.name).join(', ') : (populated.staffId?.name || 'Assigned Stylist');
                        
                        await sendWapixoTemplate(populated.clientId.phone, process.env.WHATSAPP_TEMPLATE_BOOKING_LINK, [
                            clientName, salonName, populated.outletId?.name || 'Our Salon',
                            populated.outletId?.city || 'Our Location', staffNames, populated.serviceId?.name || 'Service',
                            dateStr, timeStr
                        ]);
                    } else {
                        await sendWhatsAppMessage(populated.clientId.phone, `Hi ${clientName}, your booking at ${salonName} is now ${booking.status.toUpperCase()}. ${statusMsgs[booking.status] || ''}`);
                    }
                }

                // WhatsApp to Admins
                const canSendAdmStatus = await checkAndDeductWhatsAppCredit(populated.outletId?._id || booking.outletId);
                if (canSendAdmStatus) {
                    const admins = await User.find({ salonId: booking.salonId, role: 'admin', status: 'active' });
                    for (const ad of admins) {
                        if (ad.phone) {
                            await sendWhatsAppMessage(ad.phone, `Admin Alert: ${adminMsg}`);
                        }
                    }
                }
            }
        } catch (notifErr) {
            console.error('Unified Booking Notification failed:', notifErr.message);
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get available slots for staff, service and date
// @route   GET /api/bookings/available-slots
// @access  Public/Private
exports.getAvailableSlots = async (req, res) => {
    try {
        const { staffId, serviceId, date } = req.query;

        if (!staffId || !serviceId || !date) {
            return res.status(400).json({ success: false, message: 'staffId, serviceId and date are required' });
        }

        // 1. Get Staff and Service details
        const staff = await Staff.findById(staffId);
        const service = await Service.findById(serviceId);

        if (!staff || !service) {
            return res.status(404).json({ success: false, message: 'Staff or Service not found' });
        }

        const serviceDuration = service.duration || 30;
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

        // 2. Get Staff Working Hours for that day
        const dayAvailability = staff.availability?.days?.[dayName] || [];
        if (dayAvailability.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // 3. Get Breaks (Combine Daily Recurring Breaks + Date Specific Breaks)
        const dailyBreaks = staff.availability?.breaks || [];
        const breakDoc = await Break.findOne({ staffId, date });
        const specificBreaks = breakDoc ? breakDoc.breaks : [];
        
        const breaks = [...dailyBreaks, ...specificBreaks];

        // 4. Get Existing Bookings for that staff and date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await Booking.find({
            staffId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled', 'no-show'] }
        });

        // Helper: Convert "HH:mm" to minutes from midnight
        const toMinutes = (timeStr) => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };

        // Helper: Convert minutes from midnight to "HH:mm"
        const fromMinutes = (mins) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        // 5. Generate Slots
        const availableSlots = [];
        
        // Process each working hour block (staff can have multiple shifts per day)
        dayAvailability.forEach(shift => {
            let current = toMinutes(shift.start);
            const shiftEnd = toMinutes(shift.end);

            while (current + serviceDuration <= shiftEnd) {
                const slotStart = current;
                const slotEnd = current + serviceDuration;

                // Check if slot overlaps with any break
                const hasBreakOverlap = breaks.some(b => {
                    const bStart = toMinutes(b.start);
                    const bEnd = toMinutes(b.end);
                    return !(slotEnd <= bStart || slotStart >= bEnd);
                });

                // Check if slot overlaps with any booking
                const hasBookingOverlap = bookings.some(b => {
                    const bTimeStr = b.time || b.appointmentDate.toTimeString().substring(0, 5);
                    const bStart = toMinutes(bTimeStr);
                    const bEnd = bStart + (b.duration || 30); // Use stored duration or default to 30
                    return !(slotEnd <= bStart || slotStart >= bEnd);
                });

                if (!hasBreakOverlap && !hasBookingOverlap) {
                    availableSlots.push(fromMinutes(slotStart));
                }

                // Increment by 30 mins or service duration? 
                // User's example suggests incrementing by serviceDuration, 
                // but usually, we allow bookings every 15 or 30 mins.
                // Let's stick to 30 min intervals for slot starts as seen in their UI.
                current += 30; 
            }
        });

        // Filter out past slots if the requested date is today
        const now = new Date();
        const nowStr = now.getFullYear() + '-' + 
                      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(now.getDate()).padStart(2, '0');
        
        const isToday = date === nowStr;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const finalSlots = isToday 
            ? availableSlots.filter(slotTime => toMinutes(slotTime) > currentMinutes)
            : availableSlots;

        res.json({
            success: true,
            data: finalSlots
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get availability for outlet and date
// @route   GET /api/bookings/availability
// @access  Private
exports.getAvailability = async (req, res) => {
    try {
        const { outletId, date } = req.query;
        if (!outletId || !date) {
            return res.status(400).json({ success: false, message: 'outletId and date are required' });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch all non-cancelled bookings for that day/outlet
        const bookings = await Booking.find({
            outletId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled', 'no-show'] }
        }).select('appointmentDate duration staffId');

        // Transform into a format easy for frontend to evaluate overlaps
        const result = bookings.map(b => ({
            id: b._id,
            start: b.appointmentDate,
            end: new Date(new Date(b.appointmentDate).getTime() + (b.duration || 30) * 60000),
            staffId: b.staffId
        }));

        res.json({
            success: true,
            bookings: result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create Razorpay Order
// @route   POST /api/bookings/payment/order
// @access  Private
exports.createPaymentOrder = async (req, res) => {
    try {
        const { amount, receipt } = req.body;
        if (!amount) {
            return res.status(400).json({ success: false, message: 'Amount is required' });
        }

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: receipt || `receipt_${Date.now()}`
        };

        if (!razorpay) {
            return res.status(500).json({ success: false, message: 'Razorpay is not configured' });
        }
        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (err) {
        console.error('Razorpay Order Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/bookings/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const secret = process.env.RAZORPAY_KEY_SECRET;
        
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        const digest = shasum.digest('hex');

        if (digest === razorpaySignature) {
            res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        console.error('Razorpay Verification Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all bookings for a specific customer
// @route   GET /api/bookings/customer/:customerId
// @access  Private
exports.getCustomerBookings = async (req, res) => {
    try {
        const { customerId } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const totalCount = await Booking.countDocuments({ clientId: customerId });
        const bookings = await Booking.find({ clientId: customerId })
            .populate('serviceId', 'name price duration isInclusiveTax gst')
            .populate('staffId', 'name profileImage')
            .populate('outletId', 'name address city')
            .populate('salonId', 'name logo')
            .sort({ appointmentDate: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: bookings
        });
    } catch (err) {
        console.error('getCustomerBookings error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get booking details
// @route   GET /api/booking-details/:bookingId
// @access  Private
exports.getBookingDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId)
            .populate('clientId', 'name phone email totalVisits totalSpend')
            .populate('serviceId', 'name price duration description isInclusiveTax gst')
            .populate('staffId', 'name profileImage phone')
            .populate('outletId', 'name address city phone')
            .populate('salonId', 'name logo businessName');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking details not found' });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (err) {
        console.error('getBookingDetails error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
