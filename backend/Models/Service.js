const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    duration: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    image: String,
    gst: {
        type: Number
    },
    isInclusiveTax: {
        type: Boolean,
        default: false
    },
    commissionApplicable: {
        type: Boolean,
        default: true
    },
    commissionType: {
        type: String,
        enum: ['percent', 'fixed'],
        default: 'percent'
    },
    commissionValue: {
        type: Number,
        default: 0
    },
    outletIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet'
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    gender: {
        type: String,
        enum: ['men', 'women', 'both'],
        default: 'both'
    },

    resourceType: {
        type: String,
        enum: ['chair', 'room', 'cabin', 'none'],
        default: 'chair'
    },
    isRepeated: {
        type: Boolean,
        default: false
    },
    reminderDays: {
        type: Number,
        default: 30
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
