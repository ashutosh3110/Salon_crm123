import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const STATUS = ['draft', 'approved', 'paid'];

const payrollEntrySchema = new mongoose.Schema(
    {
        year: { type: Number, required: true, min: 2000, max: 2100 },
        month: { type: Number, required: true, min: 1, max: 12 },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        baseSalary: { type: Number, default: 0, min: 0 },
        commission: { type: Number, default: 0, min: 0 },
        deductions: { type: Number, default: 0, min: 0 },
        netPay: { type: Number, default: 0, min: 0 },
        workingDays: { type: Number, default: 30, min: 0, max: 31 },
        status: { type: String, enum: STATUS, default: 'draft' },
        bankName: { type: String, trim: true, default: '' },
        bankAccountNo: { type: String, trim: true, default: '' },
        ifsc: { type: String, trim: true, default: '' },
    },
    { timestamps: true }
);

payrollEntrySchema.plugin(tenantPlugin);
payrollEntrySchema.index({ tenantId: 1, year: 1, month: 1, userId: 1 }, { unique: true });
payrollEntrySchema.index({ tenantId: 1, year: 1, month: 1 });

function computeNet(doc) {
    const n = Number(doc.baseSalary || 0) + Number(doc.commission || 0) - Number(doc.deductions || 0);
    doc.netPay = Math.max(0, Math.round(n * 100) / 100);
}

// Mongoose 8+ / 9: sync hooks are invoked without a `next` callback — calling next() caused "next is not a function".
payrollEntrySchema.pre('save', function () {
    computeNet(this);
});

const PayrollEntry = mongoose.model('PayrollEntry', payrollEntrySchema);
export default PayrollEntry;
export { STATUS as PAYROLL_ENTRY_STATUS };
