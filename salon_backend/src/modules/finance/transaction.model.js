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
            enum: [
                'sales',
                'service',
                'commission',
                'salary',
                'rent',
                'inventory',
                'utilities',
                'maintenance',
                'marketing',
                'supplies',
                'welfare',
                'other',
            ],
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
        /** Optional: which outlet this expense applies to (admin finance) */
        outletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet',
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

transactionSchema.index({ tenantId: 1, type: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
