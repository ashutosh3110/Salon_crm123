const mongoose = require('mongoose');

const endOfDaySchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        unique: true // Ensure only one report per day per salon
    },
    openingCash: {
        type: Number,
        default: 0
    },
    totalCashIncome: {
        type: Number,
        default: 0
    },
    totalCashExpense: {
        type: Number,
        default: 0
    },
    totalBankIncome: {
        type: Number,
        default: 0
    },
    totalBankExpense: {
        type: Number,
        default: 0
    },
    expectedCash: {
        type: Number,
        required: true
    },
    actualCash: {
        type: Number,
        required: true
    },
    discrepancy: {
        type: Number, // actualCash - expectedCash
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'closed'],
        default: 'closed'
    },
    notes: String,
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EndOfDay', endOfDaySchema);
