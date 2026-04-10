const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
    gender: {
        type: String,
        enum: ['men', 'women', 'both'],
        default: 'women'
    },
    image: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for service count
categorySchema.virtual('serviceCount', {
    ref: 'Service',
    localField: 'name', // Using name because Service model stores category as string currently
    foreignField: 'category',
    count: true
});

module.exports = mongoose.model('Category', categorySchema);
