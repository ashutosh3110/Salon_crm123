import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
            private: true, // used by the toJSON plugin
        },
        role: {
            type: String,
            enum: ['superadmin', 'admin', 'manager', 'receptionist', 'stylist', 'accountant', 'inventory_manager'],
            required: true,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: function () { return this.role !== 'superadmin'; }
        },
        outletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet',
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        phone: {
            type: String,
            trim: true,
        },
        specialist: {
            type: String,
            trim: true,
        },
        joinedDate: {
            type: Date,
            default: Date.now,
        },
        /** HR / payroll (optional) */
        salary: {
            type: Number,
            default: 0,
        },
        dob: {
            type: String,
            trim: true,
            default: '',
        },
        pan: {
            type: String,
            trim: true,
            default: '',
        },
        address: {
            type: String,
            trim: true,
            default: '',
        },
        bankName: {
            type: String,
            trim: true,
            default: '',
        },
        bankAccountNo: {
            type: String,
            trim: true,
            default: '',
        },
        ifsc: {
            type: String,
            trim: true,
            default: '',
        },
        onboardingStatus: {
            type: String,
            enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
            default: 'NOT_STARTED',
        },
        /** HR performance tab: revenue target (₹). Unset = server default (see hrPerformance service). */
        performanceGoal: {
            type: Number,
            min: 0,
        },
        /** Public / app profile image URL or small data URL */
        avatar: {
            type: String,
            trim: true,
            default: '',
            maxlength: 500000,
        },
        stylistBio: { type: String, trim: true, default: '', maxlength: 5000 },
        stylistExperience: { type: String, trim: true, default: '', maxlength: 200 },
        stylistClientsLabel: { type: String, trim: true, default: '', maxlength: 200 },
        stylistSpecializations: [{ type: String, trim: true, maxlength: 120 }],
        stylistSkills: [
            {
                name: { type: String, trim: true, maxlength: 120 },
                level: { type: String, enum: ['expert', 'intermediate'], default: 'intermediate' },
                icon: { type: String, trim: true, default: '', maxlength: 32 },
            },
        ],
        stylistWeeklyAvailability: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        /** Firebase Cloud Messaging tokens for push notifications (multi-device) */
        fcmTokens: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
userSchema.index({ tenantId: 1 });

/**
 * Check if email is taken
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
};

/**
 * Check if password matches the user's password
 */
userSchema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function () {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
});

const User = mongoose.model('User', userSchema);

export default User;
