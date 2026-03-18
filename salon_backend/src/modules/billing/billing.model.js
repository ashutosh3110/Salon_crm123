import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription',
        },
        planName: String,
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        taxAmount: {
            type: Number,
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'INR',
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded', 'overdue'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['razorpay', 'stripe', 'bank_transfer', 'offline', 'none'],
            default: 'none',
        },
        paymentDate: Date,
        dueDate: Date,
        transactionId: String,
        billingPeriod: {
            from: Date,
            to: Date,
        },
        notes: String,
    },
    {
        timestamps: true,
    }
);

billingSchema.index({ status: 1 });

const Billing = mongoose.model('Billing', billingSchema);

export default Billing;
