import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const shiftSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        /** 24h "HH:mm" */
        startTime: { type: String, required: true, trim: true },
        endTime: { type: String, required: true, trim: true },
        outletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet',
            required: true,
        },
        colorHex: { type: String, trim: true, default: '#10b981' },
        /** Tailwind bg-* class for UI */
        colorClass: { type: String, trim: true, default: 'bg-emerald-500' },
        /** 0=Mon, 6=Sun (optional for recurring) */
        dayOfWeek: { type: Number, min: 0, max: 6 },
        /** Specific date (optional for one-off) */
        date: { type: String, trim: true }, 
        /** Status for swaps/approvals */
        status: { 
            type: String, 
            enum: ['Active', 'Pending', 'SwapRequested', 'Completed'],
            default: 'Active'
        },
        assignedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

shiftSchema.plugin(tenantPlugin);

shiftSchema.index({ tenantId: 1, createdAt: -1 });

const Shift = mongoose.model('Shift', shiftSchema);
export default Shift;
