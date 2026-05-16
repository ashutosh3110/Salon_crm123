const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon'
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    paymentId: String, // Razorpay Payment ID
    orderId: String,   // Razorpay Order ID
    expiryDate: Date,  // Optional expiry date for promotional credits
    remainingAmount: { // Remaining portion of this credit that can be spent
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'EXPIRED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
