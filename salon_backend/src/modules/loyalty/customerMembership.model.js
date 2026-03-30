import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const customerMembershipSchema = new mongoose.Schema(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
        planId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
        status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
        startDate: { type: Date, default: Date.now },
        expiryDate: { type: Date, required: true },
        paymentId: { type: String }, // Razorpay Payment ID
        orderId: { type: String },   // Razorpay Order ID
        amount: { type: Number, required: true },
        autoRenew: { type: Boolean, default: false },
    },
    { timestamps: true }
);

customerMembershipSchema.plugin(tenantPlugin);
customerMembershipSchema.index({ tenantId: 1, customerId: 1, status: 1 });
customerMembershipSchema.index({ expiryDate: 1 });

const CustomerMembership = mongoose.model('CustomerMembership', customerMembershipSchema);
export default CustomerMembership;
