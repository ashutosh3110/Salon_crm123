import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true
        },
        outletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet',
            required: true
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        items: [
            {
                type: { type: String, enum: ['service', 'product'], required: true },
                itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
                name: String,
                price: Number,
                quantity: { type: Number, default: 1 },
                total: Number,
                stylistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                startTime: Date,
                endTime: Date,
            },
        ],
        subTotal: Number,
        tax: Number,
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'partially_paid', 'cancelled'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'online', 'unpaid'],
            default: 'cash',
        },
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        promotionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Promotion',
        }
    },
    {
        timestamps: true,
    }
);

// Indexed per requirements
invoiceSchema.index({ invoiceNumber: 1, tenantId: 1 }, { unique: true });
invoiceSchema.index({ tenantId: 1, createdAt: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
