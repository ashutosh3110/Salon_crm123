import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const membershipPlanSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        duration: { type: Number, required: true, min: 1, default: 30 }, // days
        benefits: { type: [String], default: [] },
        includedServices: { type: [String], default: [] },
        isActive: { type: Boolean, default: true },
        isPopular: { type: Boolean, default: false },
        icon: { type: String, enum: ['star', 'crown', 'gem'], default: 'star' },
        gradient: { type: String, default: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)' },
    },
    { timestamps: true }
);

membershipPlanSchema.plugin(tenantPlugin);
membershipPlanSchema.index({ tenantId: 1, isActive: 1, updatedAt: -1 });

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
export default MembershipPlan;
