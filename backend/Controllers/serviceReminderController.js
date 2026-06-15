const ServiceReminder = require('../Models/ServiceReminder');

exports.getReminders = async (req, res) => {
    try {
        const { outletId } = req.query;
        let query = {};
        
        if (outletId && outletId !== 'all') {
            query.salonId = outletId;
        }

        const reminders = await ServiceReminder.find(query)
            .populate('customerId', 'name phone profileImage')
            .populate('serviceId', 'name')
            .populate('bookingId', 'appointmentDate')
            .sort({ dueDate: 1 });

        res.json({ success: true, data: reminders });
    } catch (err) {
        console.error('Error fetching service reminders:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const reminder = await ServiceReminder.findByIdAndUpdate(
            id,
            { status, sentAt: status === 'sent' ? new Date() : undefined },
            { new: true }
        )
            .populate('customerId', 'name phone profileImage')
            .populate('serviceId', 'name')
            .populate('bookingId', 'appointmentDate');

        if (!reminder) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }

        res.json({ success: true, data: reminder });
    } catch (err) {
        console.error('Error updating service reminder:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
