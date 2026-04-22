const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a campaign name']
    },
    type: {
        type: String,
        enum: ['bulk', 'segmented', 'selective'],
        default: 'bulk'
    },
    segment: {
        type: String,
        default: 'all'
    },
    selectedCustomers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }],
    message: {
        type: String,
        required: [true, 'Please add a message template']
    },
    channel: {
        type: String,
        enum: ['whatsapp', 'sms', 'email'],
        default: 'whatsapp'
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'sending', 'completed', 'failed'],
        default: 'completed'
    },
    sentCount: {
        type: Number,
        default: 0
    },
    readCount: {
        type: Number,
        default: 0
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
