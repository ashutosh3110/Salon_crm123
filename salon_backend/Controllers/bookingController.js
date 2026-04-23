const Booking = require('../Models/Booking');
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
            .populate('serviceId', 'name price duration')
            .populate('staffId', 'name profileImage')
            .populate('outletId', 'name address city')
            .populate('salonId', 'name logo')
            .sort({ appointmentDate: -1 });

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
        const { serviceId, paymentMethod } = req.body;
        
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
        let totalPrice = service.price;
        const activeMembership = await CustomerMembership.findOne({
            customerId: targetCustomerId,
            status: 'active',
            expiryDate: { $gt: new Date() }
        }).populate('planId');

        if (activeMembership && activeMembership.planId) {
            const plan = activeMembership.planId;
            if (plan.serviceDiscountValue > 0) {
                if (plan.serviceDiscountType === 'percentage') {
                    totalPrice -= (totalPrice * plan.serviceDiscountValue) / 100;
                } else {
                    totalPrice -= plan.serviceDiscountValue;
                }
            }
        }
        totalPrice = Math.max(0, Math.floor(totalPrice));

        // Handle Wallet Payment
        if (paymentMethod === 'Wallet' || paymentMethod === 'wallet') {
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }

            if ((customer.walletBalance || 0) < totalPrice) {
                return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
            }

            // Deduct balance
            customer.walletBalance -= totalPrice;
            
            // Increment total spend and visits
            customer.totalSpend = (customer.totalSpend || 0) + totalPrice;
            customer.totalVisits = (customer.totalVisits || 0) + 1;
            
            await customer.save();

            // Create wallet transaction
            await WalletTransaction.create({
                customerId: targetCustomerId,
                salonId: salonId,
                amount: totalPrice,
                type: 'DEBIT',
                description: `Payment for service: ${service.name}`,
                status: 'COMPLETED'
            });
        }

        const booking = await Booking.create({
            ...req.body,
            salonId,
            subtotal: service.price,
            membershipDiscount: service.price - totalPrice,
            totalPrice: totalPrice,
            paymentStatus: (paymentMethod === 'Wallet' || paymentMethod === 'wallet') ? 'paid' : 'pending'
        });

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
            .populate('serviceId', 'name price duration')
            .populate('staffId', 'name profileImage')
            .populate('outletId', 'name address city')
            .populate('salonId', 'name logo');

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

        if (booking.salonId.toString() !== req.user.salonId.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const oldStatus = booking.status;
        booking.status = req.body.status;

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
                const salon = await Salon.findById(booking.salonId);
                if (salon && salon.loyaltySetting && salon.loyaltySetting.active) {
                    const rate = salon.loyaltySetting.pointsRate || 100;
                    const points = Math.floor(booking.totalPrice / rate);
                    
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
                }
            } catch (error) {
                console.error('Error awarding loyalty points:', error);
            }
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

        res.json({
            success: true,
            data: availableSlots
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
