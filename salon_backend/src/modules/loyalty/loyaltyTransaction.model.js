import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const loyaltyTransactionSchema = new mongoose.Schema(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
        type: { type: String, enum: ['EARN', 'REDEEM', 'REVERSE'], required: true },
        points: { type: Number, required: true },
        invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
        expiryDate: { type: Date },
        referenceId: { type: mongoose.Schema.Types.ObjectId }, // For reversals or referrals
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

loyaltyTransactionSchema.plugin(tenantPlugin);
loyaltyTransactionSchema.index({ tenantId: 1, customerId: 1 });
loyaltyTransactionSchema.index({ invoiceId: 1 });

const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
export default LoyaltyTransaction;
