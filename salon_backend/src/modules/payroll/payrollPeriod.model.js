import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

/** One row per tenant + calendar month — lock flag for the whole month */
const payrollPeriodSchema = new mongoose.Schema(
    {
        year: { type: Number, required: true, min: 2000, max: 2100 },
        month: { type: Number, required: true, min: 1, max: 12 },
        locked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

payrollPeriodSchema.plugin(tenantPlugin);
payrollPeriodSchema.index({ tenantId: 1, year: 1, month: 1 }, { unique: true });

const PayrollPeriod = mongoose.model('PayrollPeriod', payrollPeriodSchema);
export default PayrollPeriod;
