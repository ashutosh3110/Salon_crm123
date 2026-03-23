import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const cashBankReconciliationSchema = new mongoose.Schema(
    {
        businessDate: {
            type: String,
            required: true,
            index: true,
        },
        actualCash: { type: Number, default: null },
        actualBank: { type: Number, default: null },
        notes: { type: String, default: '' },
        locked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

cashBankReconciliationSchema.plugin(tenantPlugin);
cashBankReconciliationSchema.index({ tenantId: 1, businessDate: 1 }, { unique: true });

const CashBankReconciliation = mongoose.model('CashBankReconciliation', cashBankReconciliationSchema);
export default CashBankReconciliation;
