const mongoose = require('mongoose');

const stockTransferSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    fromOutletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet',
        required: true
    },
    toOutletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet',
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    reason: {
        type: String,
        default: 'Stock Balancing'
    },
    notes: {
        type: String,
        default: ''
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'PENDING', 'CANCELLED'],
        default: 'COMPLETED'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StockTransfer', stockTransferSchema);
