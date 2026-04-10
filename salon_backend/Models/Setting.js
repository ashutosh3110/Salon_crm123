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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
