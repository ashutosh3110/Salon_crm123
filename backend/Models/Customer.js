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
    },
    outletWallets: [{
        outletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet'
        },
        balance: {
            type: Number,
            default: 0
        }
    }],
    dueAmount: {
        type: Number,
        default: 0
    },
    paymentReminderCount: {
        type: Number,
        default: 0
    },
    lastPaymentReminderSentAt: {
        type: Date
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    category: {
        type: String,
        default: 'Regular'
    },
    remarks: String,
    preferredService: String,
    isVIP: {
        type: Boolean,
        default: false
    },
    totalSpend: {
        type: Number,
        default: 0
    },
    totalVisits: {
        type: Number,
        default: 0
    },
    lastVisit: Date,
    lastOutletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet'
    },
    welcomeSent: {
        type: Boolean,
        default: false
    },
    birthdayWishSent: {
        type: Boolean,
        default: false
    },
    anniversaryWishSent: {
        type: Boolean,
        default: false
    },
    lastBirthdayWishSentAt: {
        type: Date
    },
    lastAnniversaryWishSentAt: {
        type: Date
    },
    fcmTokenWeb: [String],
    fcmTokenMobile: [String],
    likedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    likedServices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
}, {
    timestamps: true
});

// Global unique index for phone (One profile across all salons)
customerSchema.index({ phone: 1 }, { unique: true });

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
