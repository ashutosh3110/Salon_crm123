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
        image: {
            type: String,
        },
        gst: {
            type: Number,
            default: 18,
        },
        commissionApplicable: {
            type: Boolean,
            default: true,
        },
        commissionType: {
            type: String,
            enum: ['percent', 'fixed'],
            default: 'percent',
        },
        commissionValue: {
            type: Number,
            default: 0,
        },
        outletIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Outlet',
            }
        ],
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
