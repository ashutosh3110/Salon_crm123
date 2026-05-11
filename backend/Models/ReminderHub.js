const mongoose = require('mongoose');

const reminderHubSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true,
        unique: true
    },
    rules: [{
        category: String,
        interval: { type: Number, default: 30 },
        channel: { type: String, default: 'WhatsApp' },
        message: String,
        active: { type: Boolean, default: true }
    }],
    bridalBookings: [{
        clientName: String,
        clientPhone: String,
        eventName: String,
        eventDate: Date,
        service: String,
        reminders: [{
            label: String,
            daysBefore: Number,
            active: { type: Boolean, default: true },
            sentAt: Date
        }]
    }],
    settings: {
        salonSlug: String,
        welcomeMsg: String,
        showServices: { type: Boolean, default: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('ReminderHub', reminderHubSchema);
