const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT', 'REDEEM', 'EARN', 'REVERSE', 'REDEEMED'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    referenceId: {
        type: String, // Can be orderId or bookingId
    },
    source: {
        type: String,
        enum: ['WALLET_TOPUP', 'BOOKING', 'REFUND', 'MANUAL', 'REFERRAL'],
        default: 'MANUAL'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
