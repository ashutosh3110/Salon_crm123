import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        sku: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
        },
        stock: {
            type: Number,
            default: 0,
        },
        lowStockThreshold: {
            type: Number,
            default: 5,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

productSchema.plugin(tenantPlugin);
productSchema.index({ sku: 1, tenantId: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
