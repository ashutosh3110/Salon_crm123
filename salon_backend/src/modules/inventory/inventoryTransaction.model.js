import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const inventoryTransactionSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        outletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet',
            required: true,
        },
        type: {
            type: String,
            enum: ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN'],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId, // Could be Invoice ID, Purchase ID, etc.
        },
        reason: String,
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        /** Stock-in extras (admin purchase log) */
        purchasePrice: { type: Number },
        taxRate: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        attachmentUrl: { type: String, default: '' },
        invoiceRef: { type: String },
        supplierName: { type: String },
        /** For type ADJUSTMENT: ADD = add qty, DEDUCT = remove (stock out) */
        adjustmentDirection: {
            type: String,
            enum: ['ADD', 'DEDUCT'],
        },
        expiryDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

inventoryTransactionSchema.plugin(tenantPlugin);

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransaction;
