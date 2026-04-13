const Booking = require('../Models/Booking');
const User = require('../Models/User');
const Service = require('../Models/Service');
const Customer = require('../Models/Customer');
const Salon = require('../Models/Salon');
const WalletTransaction = require('../Models/WalletTransaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

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
            .populate('outletId', 'name')
            .sort({ appointmentDate: -1 });

        // Rename client to match frontend expectation if needed, or fix frontend
        const result = bookings.map(b => ({
            ...b._doc,
            client: b.clientId, // Frontend expects .client
            service: b.serviceId, // Frontend expects .service
            staff: b.staffId, // Frontend expects .staff
            outlet: b.outletId // Frontend expects .outlet
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

        const totalPrice = service.price;

        // Handle Wallet Payment
        if (paymentMethod === 'Wallet' || paymentMethod === 'wallet') {
            const customer = await Customer.findById(req.user._id);
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }

            if ((customer.walletBalance || 0) < totalPrice) {
                return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
            }

            // Deduct balance
            customer.walletBalance -= totalPrice;
            await customer.save();

            // Create wallet transaction
            await WalletTransaction.create({
                customerId: req.user._id,
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
            totalPrice: totalPrice,
            paymentStatus: (paymentMethod === 'Wallet' || paymentMethod === 'wallet') ? 'paid' : 'pending'
        });

        const populated = await Booking.findById(booking._id)
            .populate('clientId', 'name phone email')
            .populate('serviceId', 'name price duration')
            .populate('staffId', 'name profileImage')
            .populate('outletId', 'name');

        res.status(201).json({
            success: true,
            data: {
                ...populated._doc,
                client: populated.clientId,
                service: populated.serviceId,
                staff: populated.staffId,
                outlet: populated.outletId
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
        res.status(500).json({ success: false, message: 'Server Error' });
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
