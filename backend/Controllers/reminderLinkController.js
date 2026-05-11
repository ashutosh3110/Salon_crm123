const ReminderHub = require('../Models/ReminderHub');
const Customer = require('../Models/Customer');
const Booking = require('../Models/Booking');

// @desc    Get current state of reminders and links
// @route   GET /api/reminders-links/state
// @access  Private
exports.getState = async (req, res) => {
    try {
        let hub = await ReminderHub.findOne({ salonId: req.user.salonId });
        
        if (!hub) {
            hub = await ReminderHub.create({
                salonId: req.user.salonId,
                settings: {
                    salonSlug: req.user.salonId.toString().slice(-8),
                    welcomeMsg: 'Welcome to our salon. Book your next visit below.',
                    showServices: true
                }
            });
        }

        res.json({
            success: true,
            reminderRules: hub.rules || [],
            bridalBookings: hub.bridalBookings || [],
            bookingSettings: hub.settings || {}
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Add a reminder rule
// @route   POST /api/reminders-links/rules
// @access  Private
exports.addRule = async (req, res) => {
    try {
        const hub = await ReminderHub.findOneAndUpdate(
            { salonId: req.user.salonId },
            { $push: { rules: req.body } },
            { new: true, upsert: true }
        );
        res.json({ success: true, data: hub.rules });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Toggle or update a rule
// @route   PATCH /api/reminders-links/rules/:id
// @access  Private
exports.updateRule = async (req, res) => {
    try {
        const { id } = req.params;
        const hub = await ReminderHub.findOneAndUpdate(
            { salonId: req.user.salonId, "rules._id": id },
            { $set: { "rules.$": { ...req.body, _id: id } } },
            { new: true }
        );
        res.json({ success: true, data: hub.rules });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Add bridal booking
// @route   POST /api/reminders-links/bridal-bookings
// @access  Private
exports.addBridalBooking = async (req, res) => {
    try {
        const hub = await ReminderHub.findOneAndUpdate(
            { salonId: req.user.salonId },
            { $push: { bridalBookings: req.body } },
            { new: true, upsert: true }
        );
        res.json({ success: true, data: hub.bridalBookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Toggle bridal reminder
// @route   PATCH /api/reminders-links/bridal-bookings/:bookingId/reminders/:remId/toggle
// @access  Private
exports.toggleBridalReminder = async (req, res) => {
    try {
        const { bookingId, remId } = req.params;
        const hub = await ReminderHub.findOne({ salonId: req.user.salonId });
        
        if (!hub) return res.status(404).json({ success: false, message: 'Hub not found' });

        const booking = hub.bridalBookings.id(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const reminder = booking.reminders.id(remId);
        if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found' });

        reminder.active = !reminder.active;
        await hub.save();

        res.json({ success: true, data: hub.bridalBookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get pending service signals
// @route   GET /api/reminders-links/service-signals/pending
// @access  Private
exports.getPendingSignals = async (req, res) => {
    try {
        const hub = await ReminderHub.findOne({ salonId: req.user.salonId });
        if (!hub || !hub.rules || hub.rules.length === 0) {
            return res.json({ success: true, results: [] });
        }

        const results = [];
        const rules = hub.rules.filter(r => r.active);

        for (const rule of rules) {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - rule.interval);

            // Find customers whose last booking for this category was 'interval' days ago
            // For simplicity, we just look at the last booking date
            const bookings = await Booking.find({
                salonId: req.user.salonId,
                status: 'completed',
                appointmentDate: { $lte: daysAgo }
            }).populate('clientId serviceId').limit(20);

            for (const b of bookings) {
                if (b.clientId && b.serviceId && b.serviceId.category === rule.category) {
                     results.push({
                        id: `${b.clientId._id}-${rule._id}`,
                        clientId: b.clientId._id,
                        name: b.clientId.name,
                        service: b.serviceId.name,
                        ruleId: rule._id,
                        lastDate: b.appointmentDate
                     });
                }
            }
        }

        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update reminder settings
// @route   PATCH /api/reminders-links/settings
// @access  Private
exports.updateSettings = async (req, res) => {
    try {
        const hub = await ReminderHub.findOneAndUpdate(
            { salonId: req.user.salonId },
            { $set: { settings: req.body } },
            { new: true, upsert: true }
        );
        res.json({ success: true, data: hub.settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
