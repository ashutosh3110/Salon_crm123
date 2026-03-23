import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const supplierInvoicePaymentSchema = new mongoose.Schema(
    {
        /** Stable key from stock-in aggregation (INV:ref::name or TXN:id) */
        invoiceKey: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        note: {
            type: String,
            trim: true,
            default: '',
        },
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

supplierInvoicePaymentSchema.plugin(tenantPlugin);

supplierInvoicePaymentSchema.index({ tenantId: 1, invoiceKey: 1 });
supplierInvoicePaymentSchema.index({ tenantId: 1, createdAt: -1 });

const SupplierInvoicePayment = mongoose.model('SupplierInvoicePayment', supplierInvoicePaymentSchema);

export default SupplierInvoicePayment;
