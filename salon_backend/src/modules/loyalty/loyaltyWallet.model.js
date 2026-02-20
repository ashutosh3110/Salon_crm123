import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const loyaltyWalletSchema = new mongoose.Schema(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
        totalPoints: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
);

loyaltyWalletSchema.plugin(tenantPlugin);
loyaltyWalletSchema.index({ tenantId: 1, customerId: 1 }, { unique: true });

const LoyaltyWallet = mongoose.model('LoyaltyWallet', loyaltyWalletSchema);
export default LoyaltyWallet;
