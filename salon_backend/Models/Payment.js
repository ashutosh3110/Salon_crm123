const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    signature: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'captured', 'failed', 'pending', 'refunded'],
        default: 'created'
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
