import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const STATUS_VALUES = ['present', 'late', 'absent', 'half-day', 'leave'];

const attendanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        /** Calendar day for the salon (YYYY-MM-DD), same as admin date picker */
        date: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: STATUS_VALUES,
            default: 'absent',
        },
        checkInAt: { type: Date, default: null },
        checkOutAt: { type: Date, default: null },
        hoursWorked: { type: Number, default: 0 },
        location: { type: String, trim: true, default: 'Salon' },
        remark: { type: String, trim: true, default: '' },
    },
    { timestamps: true }
);

attendanceSchema.plugin(tenantPlugin);

attendanceSchema.index({ tenantId: 1, userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ tenantId: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
export { STATUS_VALUES };
