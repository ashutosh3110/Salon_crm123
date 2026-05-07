const mongoose = require('mongoose');

const financeTransactionSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['income', 'expense', 'transfer'],
        required: true
    },
    category: {
        type: String, // e.g. 'Service Revenue', 'Product Sale', 'Supplier Payment', 'Operational Expense', 'Bank Deposit', 'Bank Withdrawal'
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'upi', 'card', 'cheque'],
        required: true
    },
    accountType: {
        type: String,
        enum: ['cash', 'bank'],
        required: true
    },
    description: String,
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        // Can refer to Booking, Order, SupplierInvoice, Expense, etc.
    },
    referenceType: {
        type: String, // 'Booking', 'Order', 'SupplierInvoice', 'Expense', 'PettyCash'
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    runningBalance: {
        type: Number // Balance after this transaction (optional but helpful)
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FinanceTransaction', financeTransactionSchema);
