import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

export const LEAVE_TYPES = ['CASUAL_LEAVE', 'MEDICAL_LEAVE', 'PAID_LEAVE', 'SICK_BUFFER'];
export const LEAVE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

const leaveRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: LEAVE_TYPES,
            required: true,
        },
        /** Inclusive YYYY-MM-DD */
        startDate: { type: String, required: true, trim: true },
        endDate: { type: String, required: true, trim: true },
        reason: { type: String, trim: true, default: '', maxlength: 2000 },
        status: {
            type: String,
            enum: LEAVE_STATUSES,
            default: 'PENDING',
        },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        reviewedAt: { type: Date, default: null },
        reviewNote: { type: String, trim: true, default: '', maxlength: 2000 },
    },
    { timestamps: true }
);

leaveRequestSchema.plugin(tenantPlugin);

leaveRequestSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
leaveRequestSchema.index({ tenantId: 1, status: 1, startDate: 1 });

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;
