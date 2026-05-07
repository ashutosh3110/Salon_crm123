const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        required: true,
        enum: ['Rent', 'Electricity', 'Water', 'Marketing', 'Maintenance', 'Salaries', 'Laundry', 'Consumables', 'Taxes', 'Others']
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'upi', 'card', 'petty_cash'],
        required: true
    },
    description: String,
    referenceNumber: String, // Bill no or transaction ID
    attachments: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isRecurring: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
