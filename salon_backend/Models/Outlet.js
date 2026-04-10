const mongoose = require('mongoose');

const outletSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Outlet name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // [longitude, latitude]
        }
    },
    images: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    chairs: [{
        id: Number,
        name: String
    }],
    config: {
        bookingSms: { type: Boolean, default: true },
        whatsappNotifications: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// Index for geospatial queries
outletSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Outlet', outletSchema);
