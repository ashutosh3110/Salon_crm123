const Booking = require('../Models/Booking');
const User = require('../Models/User');
const Service = require('../Models/Service');
const Customer = require('../Models/Customer');
const Salon = require('../Models/Salon');

// @desc    Get all bookings for salon
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        const bookings = await Booking.find({ salonId })
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
// @access  Private (Admin/Manager/Receptionist)
exports.createBooking = async (req, res) => {
    try {
        const salonId = req.user.salonId;
        
        // Fetch service to get price if not provided
        const service = await Service.findById(req.body.serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const booking = await Booking.create({
            ...req.body,
            salonId,
            totalPrice: service.price // Use actual service price
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
