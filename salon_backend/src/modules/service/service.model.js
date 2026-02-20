import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
        },
        duration: {
            type: Number, // in minutes
            required: true,
        },
        category: {
            type: String, // e.g., Hair, Skin, Nails
            required: true,
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

serviceSchema.plugin(tenantPlugin);

serviceSchema.index({ name: 1, tenantId: 1 }, { unique: true });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
