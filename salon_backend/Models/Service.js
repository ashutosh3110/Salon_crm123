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
    image: String,
    gst: {
        type: Number,
        default: 18
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
        enum: ['male', 'female', 'both'],
        default: 'both'
    },
    resourceType: {
        type: String,
        enum: ['chair', 'cabin', 'none'],
        default: 'chair'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
