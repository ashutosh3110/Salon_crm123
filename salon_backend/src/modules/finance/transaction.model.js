import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const transactionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['income', 'expense'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            enum: ['sales', 'service', 'commission', 'salary', 'rent', 'inventory', 'other'],
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'online', 'unpaid'],
            required: true,
        },
        invoiceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Invoice',
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId, // Can be Expense ID, Commission ID etc.
        },
        description: String,
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

transactionSchema.plugin(tenantPlugin);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
