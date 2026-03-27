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
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        /** Max distance (m) from outlet coords for stylist punch-in/out (WGS84). */
        geofenceRadiusMeters: {
            type: Number,
            default: 200,
            min: 30,
            max: 5000,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        pincode: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
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
        chairs: [
            {
                id: { type: Number, required: true },
                name: { type: String },
                status: { type: String, enum: ['active', 'inactive'], default: 'active' }
            }
        ],
    },
    {
        timestamps: true,
    }
);

outletSchema.plugin(tenantPlugin);

const Outlet = mongoose.model('Outlet', outletSchema);

export default Outlet;
