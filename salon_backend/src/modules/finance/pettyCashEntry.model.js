import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const pettyCashEntrySchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['DAY_OPEN', 'FUND_ADDED', 'EXPENSE'],
            required: true,
        },
        /** Calendar day for salon operations (YYYY-MM-DD, UTC date string) */
        businessDate: {
            type: String,
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            default: 0,
        },
        category: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
        staff: {
            type: String,
            default: '',
        },
        attachment: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

pettyCashEntrySchema.plugin(tenantPlugin);
pettyCashEntrySchema.index({ tenantId: 1, businessDate: 1, createdAt: -1 });
pettyCashEntrySchema.index({ tenantId: 1, type: 1, businessDate: 1 });

const PettyCashEntry = mongoose.model('PettyCashEntry', pettyCashEntrySchema);
export default PettyCashEntry;
