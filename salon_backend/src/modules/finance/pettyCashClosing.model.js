import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const pettyCashClosingSchema = new mongoose.Schema(
    {
        businessDate: {
            type: String,
            required: true,
            index: true,
        },
        openingBalance: { type: Number, default: 0 },
        closingBalance: { type: Number, required: true },
        discrepancy: { type: Number, default: 0 },
        denominations: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        verifiedBy: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

pettyCashClosingSchema.plugin(tenantPlugin);
pettyCashClosingSchema.index({ tenantId: 1, businessDate: 1 }, { unique: true });

const PettyCashClosing = mongoose.model('PettyCashClosing', pettyCashClosingSchema);
export default PettyCashClosing;
