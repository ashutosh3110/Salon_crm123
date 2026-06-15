const mongoose = require('mongoose');

const serviceReminderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    outletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet'
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'cancelled'],
        default: 'pending'
    },
    sentAt: {
        type: Date
    },
    failureReason: {
        type: String
    }
}, { timestamps: true });

// Index for fast querying by the cron job
serviceReminderSchema.index({ status: 1, dueDate: 1 });
serviceReminderSchema.index({ customerId: 1, serviceId: 1 });

module.exports = mongoose.model('ServiceReminder', serviceReminderSchema);
