import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const inventorySchema = new mongoose.Schema(
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
        quantity: {
            type: Number,
            default: 0,
        },
        lowStockThreshold: {
            type: Number,
            default: 5,
        },
    },
    {
        timestamps: true,
    }
);

inventorySchema.plugin(tenantPlugin);
inventorySchema.index({ productId: 1, outletId: 1, tenantId: 1 }, { unique: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
