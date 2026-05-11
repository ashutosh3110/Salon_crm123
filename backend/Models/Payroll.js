const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
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
    workingDays: {
        type: Number,
        default: 30
    },
    presentDays: {
        type: Number,
        default: 0
    },
    leaveDays: {
        type: Number,
        default: 0
    },
    baseSalary: {
        type: Number,
        required: true
    },
    incentive: {
        type: Number,
        default: 0
    },
    commission: {
        type: Number,
        default: 0
    },
    overtime: {
        type: Number,
        default: 0
    },
    pf: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    otherDeductions: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'paid', 'unpaid'],
        default: 'draft'
    },
    paymentDate: Date,
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'upi', 'cheque'],
        default: 'cash'
    },
    notes: String,
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Ensure one payroll record per staff per month
payrollSchema.index({ staffId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
