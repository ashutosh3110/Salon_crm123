import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const segmentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        rule: { type: String, default: '' },
        iconName: { type: String, default: 'Zap' },
        color: { type: String, default: 'bg-blue-50 text-blue-600 border-blue-100' },
        // Predefined segments are not stored; only custom segments get persisted here.
        isCustom: { type: Boolean, default: true },
    },
    { timestamps: true }
);

segmentSchema.plugin(tenantPlugin);
segmentSchema.index({ tenantId: 1, name: 1 });

const Segment = mongoose.model('Segment', segmentSchema);
export default Segment;

