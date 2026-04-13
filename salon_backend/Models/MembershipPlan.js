const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a plan name'],
        trim: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    duration: {
        type: Number,
        required: true,
        default: 30 // in days
    },
    benefits: {
        type: [String],
        default: []
    },
    serviceDiscountValue: {
        type: Number,
        default: 0
    },
    serviceDiscountType: {
        type: String,
        enum: ['percentage', 'flat'],
        default: 'percentage'
    },
    productDiscountValue: {
        type: Number,
        default: 0
    },
    productDiscountType: {
        type: String,
        enum: ['percentage', 'flat'],
        default: 'percentage'
    },
    color: {
        type: String,
        default: '#C8956C'
    },
    gradient: {
        type: String,
        default: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)'
    },
    icon: {
        type: String,
        default: 'star'
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
