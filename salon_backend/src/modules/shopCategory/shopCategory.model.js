import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const shopCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        /** Banner image URL or data URL (keep uploads small) */
        image: {
            type: String,
            default: '',
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

shopCategorySchema.plugin(tenantPlugin);
shopCategorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

const ShopCategory = mongoose.model('ShopCategory', shopCategorySchema);
export default ShopCategory;
