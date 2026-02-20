import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const promotionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: { type: String, enum: ['FLAT', 'PERCENTAGE', 'COMBO'], required: true },
        value: { type: Number, required: true },
        minBillAmount: { type: Number, default: 0 },
        applicableServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
        applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        usageLimit: { type: Number },
        usedCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

promotionSchema.plugin(tenantPlugin);

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
