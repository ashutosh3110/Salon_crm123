import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const outletSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        workingHours: [
            {
                day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
                isOpen: { type: Boolean, default: true },
                openTime: { type: String }, // e.g. "09:00"
                closeTime: { type: String }, // e.g. "21:00"
            }
        ],
        isMain: {
            type: Boolean,
            default: false,
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

outletSchema.plugin(tenantPlugin);

const Outlet = mongoose.model('Outlet', outletSchema);

export default Outlet;
