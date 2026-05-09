const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: false // Can be null for global/admin broadcast
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    type: {
        type: String,
        enum: ['order', 'booking', 'marketing', 'transaction', 'system'],
        default: 'system'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    actionUrl: {
        type: String
    },
    data: {
        type: Object
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
