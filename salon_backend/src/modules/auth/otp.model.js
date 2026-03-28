import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: false,
            trim: true,
        },
        email: {
            type: String,
            required: false,
            trim: true,
            lowercase: true,
        },
        otp: {
            type: String,
            required: true,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: false,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-delete expired OTPs using TTL index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phone: 1, tenantId: 1 });
otpSchema.index({ email: 1 });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
