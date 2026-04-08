import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const tenantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
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
        description: {
            type: String,
            trim: true,
        },
        gstNumber: {
            type: String,
            trim: true,
            unique: true,
            sparse: true, // Allow multiple nulls if not provided, but unique if exists
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'trial', 'expired', 'suspended', 'deleted'],
        },
        subscriptionPlan: String,
        subscriptionPlanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription',
        },
        features: {
            pos: Boolean,
            appointments: Boolean,
            inventory: Boolean,
            crm: Boolean,
            marketing: Boolean,
            payroll: Boolean,
            mobileApp: Boolean,
            finance: Boolean,
            reports: Boolean,
            whatsapp: Boolean,
            loyalty: Boolean,
            feedback: Boolean,
        },
        limits: {
            staffLimit: Number,
            outletLimit: Number,
            smsCredits: Number,
            whatsappLimit: Number,
            storageGB: Number,
        },
        settings: {
            currency: String,
            timezone: String,
            state: String,
            stateCode: String,
            serviceGst: Number,
            productGst: Number,
            inclusiveTax: Boolean,
        },
        subscriptionExpiry: Date,
        razorpaySubscriptionId: String,
        isCancelled: Boolean,
        password: {
            type: String,
            trim: true,
            private: true,
        },
        role: {
            type: String,
            default: 'admin',
        }
    },
    {
        timestamps: true,
    }
);

// Index for performance
tenantSchema.index({ status: 1 });
tenantSchema.index({ subscriptionPlan: 1 });

// Methods
tenantSchema.methods.isPasswordMatch = async function (password) {
    const tenant = this;
    return bcrypt.compare(password, tenant.password);
};

tenantSchema.pre('save', async function () {
    const tenant = this;
    if (tenant.isModified('password')) {
        tenant.password = await bcrypt.hash(tenant.password, 8);
    }
});

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
