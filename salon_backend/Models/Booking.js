const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    outletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet',
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', 
        required: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    source: {
        type: String,
        enum: ['app', 'admin', 'pos', 'web', 'APP', 'ADMIN', 'POS', 'WEB'],
        default: 'admin'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        default: 0
    },
    membershipDiscount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        default: 'salon'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'unpaid'],
        default: 'pending'
    },
    commissionApplied: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
