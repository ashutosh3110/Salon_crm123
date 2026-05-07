const mongoose = require('mongoose');

const supplierInvoiceSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    dueDate: Date,
    items: [{
        name: String,
        quantity: Number,
        unit: String,
        price: Number,
        tax: Number, // Percentage
        amount: Number
    }],
    subTotal: {
        type: Number,
        required: true
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    balanceAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['unpaid', 'partially-paid', 'paid', 'cancelled'],
        default: 'unpaid'
    },
    notes: String,
    attachments: [String], // URLs to bill photos/PDFs
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SupplierInvoice', supplierInvoiceSchema);
