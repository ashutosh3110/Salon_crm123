const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['FLAT', 'PERCENTAGE', 'COMBO'], default: 'PERCENTAGE' },
    value: { type: Number, required: true, min: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    activationMode: { type: String, enum: ['AUTO', 'COUPON'], default: 'AUTO' },
    couponCode: { type: String, uppercase: true, trim: true },
    totalUsageLimit: { type: Number, default: 1 },
    usageLimitPerCustomer: { type: Number, default: 1 },
    usageCount: { type: Number, default: 0 },
    outletIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Outlet' }],
    applicableOn: { type: String, enum: ['SERVICE', 'PRODUCT', 'BOTH'], default: 'BOTH' },
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
