const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        default: 0
    },
    monthlyPrice: {
        type: Number,
        default: 0
    },
    yearlyPrice: {
        type: Number,
        default: 0
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly', 'trial', 'forever'],
        default: 'monthly'
    },
    popular: {
        type: Boolean,
        default: false
    },
    features: {
        type: Object,
        default: {}
    },
    limits: {
        staffLimit: { type: Number, default: 0 },
        outletLimit: { type: Number, default: 0 },
        whatsappLimit: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
