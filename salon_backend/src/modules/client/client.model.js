import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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
        role: {
            type: String,
            default: 'customer',
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
        birthday: {
            type: Date,
        },
        // Customer-specific password (for optional email/password registration)
        password: {
            type: String,
            trim: true,
            private: true,
        },
        anniversary: {
            type: Date,
        },
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
        },
        /** Firebase Cloud Messaging tokens for push notifications (multi-device) */
        fcmTokens: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

clientSchema.plugin(tenantPlugin);

clientSchema.index({ phone: 1, tenantId: 1 }, { unique: true });

clientSchema.pre('save', async function () {
    const client = this;
    if (client.password && client.isModified('password')) {
        client.password = await bcrypt.hash(client.password, 8);
    }
});

clientSchema.methods.isPasswordMatch = async function (password) {
    return bcrypt.compare(password, this.password);
};

const Client = mongoose.model('Client', clientSchema);

export default Client;
