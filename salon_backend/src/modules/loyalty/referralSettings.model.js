import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const referralSettingsSchema = new mongoose.Schema(
    {
        enabled: { type: Boolean, default: true },
        referrerReward: { type: Number, default: 200, min: 0 },
        referredReward: { type: Number, default: 100, min: 0 },
        threshold: {
            type: String,
            enum: ['FIRST_SERVICE', 'REGISTRATION', 'FIRST_INVOICE_MIN_1000'],
            default: 'FIRST_SERVICE',
        },
        expiryDays: { type: Number, default: 90, min: 1 },
    },
    { timestamps: true }
);

referralSettingsSchema.plugin(tenantPlugin);
referralSettingsSchema.index({ tenantId: 1, updatedAt: -1 });

const ReferralSettings = mongoose.model('ReferralSettings', referralSettingsSchema);
export default ReferralSettings;
