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
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
