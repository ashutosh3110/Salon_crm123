import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const endOfDaySchema = new mongoose.Schema(
    {
        businessDate: {
            type: String,
            required: true,
            index: true,
        },
        closedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        closedByName: {
            type: String,
            default: '',
        },
        notes: {
            type: String,
            default: '',
        },
        /** Snapshot at close time (sales, expenses, payment split) */
        snapshot: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

endOfDaySchema.plugin(tenantPlugin);
endOfDaySchema.index({ tenantId: 1, businessDate: 1 }, { unique: true });

const EndOfDay = mongoose.model('EndOfDay', endOfDaySchema);
export default EndOfDay;
