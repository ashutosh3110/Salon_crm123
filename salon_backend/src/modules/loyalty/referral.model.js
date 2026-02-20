import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const referralSchema = new mongoose.Schema(
    {
        referrerCustomerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
        referredCustomerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
        rewardPoints: { type: Number, required: true },
        status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' },
        rewardedAt: { type: Date },
    },
    { timestamps: true }
);

referralSchema.plugin(tenantPlugin);
referralSchema.index({ tenantId: 1, referredCustomerId: 1 }, { unique: true });

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;
