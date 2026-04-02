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
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        gender: {
            type: String,
            enum: ['men', 'women', 'all'],
            default: 'all',
        },
        /** Extra fields from Product Master UI (brand, supplier, GST, app shop, etc.) */
        extended: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
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
