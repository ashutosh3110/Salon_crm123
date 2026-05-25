const mongoose = require('mongoose');

const endOfDaySchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    outletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet'
    },
    date: {
        type: Date,
        default: Date.now
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
    openingBank: {
        type: Number,
        default: 0
    },
    expectedBank: {
        type: Number,
        default: 0
    },
    actualBank: {
        type: Number,
        default: 0
    },
    bankDiscrepancy: {
        type: Number, // actualBank - expectedBank
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'closed'],
        default: 'closed'
    },
    notes: String,
    denominations: {
        type: mongoose.Schema.Types.Mixed
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

endOfDaySchema.index({ salonId: 1, outletId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('EndOfDay', endOfDaySchema);
