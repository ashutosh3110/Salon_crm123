import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Set to false to allow atomic creation flow
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active',
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
        subscriptionPlan: {
            type: String,
            enum: ['free', 'basic', 'premium', 'enterprise'],
            default: 'free',
        },
        settings: {
            currency: { type: String, default: 'INR' }, // Changed to INR as per likely target market
            timezone: { type: String, default: 'UTC' },
        },
    },
    {
        timestamps: true,
    }
);

// Index for performance
tenantSchema.index({ status: 1 });

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
