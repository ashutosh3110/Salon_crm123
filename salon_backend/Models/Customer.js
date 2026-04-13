const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: [true, 'Please specify the registering salon']
    },
    name: {
        type: String,
        default: 'New Customer',
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
    gender: {
        type: String,
        enum: ['men', 'women', 'male', 'female', 'all', 'other'],
        default: 'women'
    },
    password: {
        type: String,
        default: '123456'
    },
    dob: String,
    anniversary: String,
    address: String,
    avatar: String,
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastLogin: Date,
    otp: String,
    otpExpires: Date,
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    walletBalance: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for unique phone per salon
customerSchema.index({ phone: 1, salonId: 1 }, { unique: true });

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
