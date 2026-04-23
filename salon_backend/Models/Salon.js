const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const salonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Salon name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    ownerName: {
        type: String,
        required: [true, 'Owner name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    gstNumber: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        default: '123456'
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'expired', 'trial', 'rejected'],
        default: 'active'
    },
    subscriptionPlan: {
        type: String,
        default: 'none'
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
    subscriptionExpiry: {
        type: Date
    },
    loyaltySetting: {
        pointsRate: { type: Number, default: 100 }, // Amount per 1 point (e.g., 100 = 100 Rs per 1 pt)
        redeemValue: { type: Number, default: 1 }, // Value of 1 point in currency (e.g., 1 pt = 1 Rupee)
        minRedeemPoints: { type: Number, default: 0 },
        referralPoints: { type: Number, default: 200 },
        referredPoints: { type: Number, default: 100 },
        active: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// Hash password before saving
salonSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    // Check if already hashed
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
        return next();
    }
    
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
salonSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Salon = mongoose.model('Salon', salonSchema);
module.exports = Salon;
