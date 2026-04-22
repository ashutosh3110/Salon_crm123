const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    contactPerson: String,
    phone: {
        type: String,
        required: true
    },
    email: String,
    address: String,
    gstNumber: String,
    category: {
        type: String,
        enum: ['Products', 'Equipment', 'Services', 'Utility', 'Others'],
        default: 'Products'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    currentBalance: {
        type: Number, // Negative means we owe them (Credit), Positive means they owe us (Debit)
        default: 0
    },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);
