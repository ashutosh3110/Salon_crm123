import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        gender: {
            type: String,
            enum: ['men', 'women', 'both'],
            default: 'both',
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

categorySchema.plugin(tenantPlugin);

categorySchema.index({ name: 1, tenantId: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
