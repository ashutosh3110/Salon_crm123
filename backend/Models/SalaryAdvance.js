const mongoose = require('mongoose');

const salaryAdvanceSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    month: {
        type: Number, // 1-12
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'paid'],
        default: 'paid'
    },
    isAdjusted: {
        type: Boolean,
        default: false
    },
    adjustedPayrollId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payroll',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SalaryAdvance', salaryAdvanceSchema);
