import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const promotionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        type: { type: String, enum: ['FLAT', 'PERCENTAGE', 'COMBO'], required: true },
        value: { type: Number, required: true },
        maxDiscountAmount: { type: Number, default: 0 }, // 0 means no limit
        minBillAmount: { type: Number, default: 0 },
        applicableServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
        applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        applicableOutlets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Outlet' }],
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        targetingType: {
            type: String,
            enum: ['ALL', 'NEW', 'REGULAR', 'INACTIVE'],
            default: 'ALL'
        },
        usageLimitPerCustomer: { type: Number, default: 1 },
        totalUsageLimit: { type: Number }, // equivalent to usageLimit
        usedCount: { type: Number, default: 0 },
        activationMode: {
            type: String,
            enum: ['AUTO', 'COUPON'],
            default: 'AUTO'
        },
        couponCode: { type: String, unique: true, sparse: true },
        startTime: { type: String }, // e.g. "10:00"
        endTime: { type: String },   // e.g. "16:00"
    },
    { timestamps: true }
);

promotionSchema.plugin(tenantPlugin);

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
