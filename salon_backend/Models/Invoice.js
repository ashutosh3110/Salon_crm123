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
        stylistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        }
    }],
    subtotal: Number,
    discount: Number,
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
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
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
