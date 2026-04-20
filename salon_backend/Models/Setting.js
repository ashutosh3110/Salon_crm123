const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'Salon CRM'
    },
    siteTagline: {
        type: String,
        default: 'Modern Salon Management'
    },
    contactEmail: {
        type: String,
        default: 'support@saloncrm.com'
    },
    contactPhone: {
        type: String,
        default: '+91 9999999999'
    },
    address: {
        type: String,
        default: '123 Salon St, Mumbai, India'
    },
    socialLinks: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' }
    },
    currency: {
        type: String,
        default: 'INR'
    },
    currencySymbol: {
        type: String,
        default: '₹'
    },
    logoUrl: {
        type: String,
        default: ''
    },
    faviconUrl: {
        type: String,
        default: ''
    },
    supportFaqs: {
        type: Array,
        default: []
    },
    loyaltySettings: {
        active: { type: Boolean, default: true },
        pointsRate: { type: Number, default: 100 }, // 100 points = 1 unit
        redeemValue: { type: Number, default: 1 },  // 1 unit = 1 currency
        minRedeemPoints: { type: Number, default: 0 }
    },
    referralSettings: {
        enabled: { type: Boolean, default: true },
        referralPoints: { type: Number, default: 200 },
        referredPoints: { type: Number, default: 100 }
    },
    maxImageSize: {
        type: Number,
        default: 5 // Default 5MB
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
