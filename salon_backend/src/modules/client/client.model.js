import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const clientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
        birthday: {
            type: Date,
        },
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

clientSchema.plugin(tenantPlugin);

clientSchema.index({ phone: 1, tenantId: 1 }, { unique: true });

const Client = mongoose.model('Client', clientSchema);

export default Client;
