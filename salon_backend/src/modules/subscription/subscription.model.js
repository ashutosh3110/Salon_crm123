import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    tag: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        enum: ['slate', 'blue', 'primary', 'amber'],
        default: 'blue'
    },
    active: {
        type: Boolean,
        default: true
    },
    popular: {
        type: Boolean,
        default: false
    },
    monthlyPrice: {
        type: Number,
        required: true,
        min: 0
    },
    yearlyPrice: {
        type: Number,
        required: true,
        min: 0
    },
    trialDays: {
        type: Number,
        default: 14,
        min: 0
    },
    features: {
        pos: { type: Boolean, default: false },
        appointments: { type: Boolean, default: false },
        inventory: { type: Boolean, default: false },
        marketing: { type: Boolean, default: false },
        payroll: { type: Boolean, default: false },
        crm: { type: Boolean, default: false },
        mobileApp: { type: Boolean, default: false },
        reports: { type: Boolean, default: false },
        whatsapp: { type: Boolean, default: false },
        loyalty: { type: Boolean, default: false },
        finance: { type: Boolean, default: false },
        feedback: { type: Boolean, default: false }
    },
    limits: {
        staffLimit: { type: Number, default: 10 },
        outletLimit: { type: Number, default: 1 },
        smsCredits: { type: Number, default: 100 },
        storageGB: { type: Number, default: 5 },
        apiCalls: { type: Number, default: 10000 }
    },
    gstStatus: {
        type: Boolean,
        default: true
    },
    gstType: {
        type: String,
        enum: ['inclusive', 'exclusive'],
        default: 'exclusive'
    },
    gstRate: {
        type: Number,
        default: 18
    },
    salonsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
