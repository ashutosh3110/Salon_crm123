import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const loyaltyRuleSchema = new mongoose.Schema(
    {
        earnRate: { type: Number, required: true, default: 1 }, // points per 1 unit of currency
        redeemRate: { type: Number, required: true, default: 0.1 }, // currency value per 1 point
        minRedeemPoints: { type: Number, default: 100 },
        maxEarnPerInvoice: { type: Number, default: 500 },
        expiryDays: { type: Number, default: 365 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

loyaltyRuleSchema.plugin(tenantPlugin);

const LoyaltyRule = mongoose.model('LoyaltyRule', loyaltyRuleSchema);
export default LoyaltyRule;
