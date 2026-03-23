import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        ownerName: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        phone: {
            type: String,
            trim: true,
            padding: true,
        },
        city: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        latitude: {
            type: Number,
            default: null,
        },
        longitude: {
            type: Number,
            default: null,
        },
        gstNumber: {
            type: String,
            trim: true,
            unique: true,
            sparse: true, // Allow multiple nulls if not provided, but unique if exists
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'trial', 'expired', 'suspended'],
            default: 'trial',
        },
        trialDays: {
            type: Number,
            default: 14,
        },
        subscriptionPlan: {
            type: String,
            enum: ['free', 'basic', 'pro', 'premium', 'enterprise', 'custom'],
            default: 'free',
        },
        mrr: {
            type: Number,
            default: 0,
        },
        totalRevenue: {
            type: Number,
            default: 0,
        },
        features: {
            pos: { type: Boolean, default: true },
            appointments: { type: Boolean, default: true },
            inventory: { type: Boolean, default: false },
            crm: { type: Boolean, default: false },
            marketing: { type: Boolean, default: false },
            payroll: { type: Boolean, default: false },
            mobileApp: { type: Boolean, default: false },
            finance: { type: Boolean, default: false },
            reports: { type: Boolean, default: true },
            whatsapp: { type: Boolean, default: false },
            loyalty: { type: Boolean, default: false },
            feedback: { type: Boolean, default: false },
        },
        limits: {
            staffLimit: { type: Number, default: 5 },
            outletLimit: { type: Number, default: 1 },
            smsCredits: { type: Number, default: 100 },
            storageGB: { type: Number, default: 2 },
        },
        outletsCount: {
            type: Number,
            default: 0,
        },
        staffCount: {
            type: Number,
            default: 0,
        },
        onboardingStatus: {
            type: String,
            enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
            default: 'NOT_STARTED',
        },
        onboardingStep: {
            type: String,
            enum: ['INITIAL', 'SALON_CONFIRMED', 'OUTLET_CREATED', 'STAFF_ADDED'],
            default: 'INITIAL',
        },
        settings: {
            currency: { type: String, default: 'INR' },
            timezone: { type: String, default: 'UTC' },
            state: { type: String, trim: true },
            stateCode: { type: String, trim: true },
            serviceGst: { type: Number, default: 18 },
            productGst: { type: Number, default: 12 },
            inclusiveTax: { type: Boolean, default: true },
            notifications: {
                bookingConfirmations: { type: Boolean, default: true },
                paymentAlerts: { type: Boolean, default: true },
                lowStockWarnings: { type: Boolean, default: true },
                dailySummary: { type: Boolean, default: false },
                marketingUpdates: { type: Boolean, default: false },
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for performance
tenantSchema.index({ status: 1 });
tenantSchema.index({ subscriptionPlan: 1 });

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
