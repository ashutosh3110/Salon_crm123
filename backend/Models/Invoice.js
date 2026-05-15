const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
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
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    items: [{
        type: {
            type: String,
            enum: ['service', 'product'],
            required: true
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            default: 1
        },
        stylistIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        }],
        isInclusiveTax: {
            type: Boolean,
            default: false
        }
    }],
    subtotal: Number,
    discount: Number,
    membershipDiscount: {
        type: Number,
        default: 0
    },
    tax: Number,
    total: Number,
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online', 'wallet', 'split'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partially_paid'],
        default: 'paid'
    },
    loyaltyPointsEarned: Number,
    loyaltyPointsRedeemed: Number,
    walletRedeemed: Number,
    payments: [{
        method: String,
        amount: Number,
        transactionId: String,
        date: { type: Date, default: Date.now }
    }],
    dueAmount: {
        type: Number,
        default: 0
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    previousDueCollected: {
        type: Number,
        default: 0
    },
    notes: String,
    status: {
        type: String,
        enum: ['active', 'cancelled', 'refunded'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
