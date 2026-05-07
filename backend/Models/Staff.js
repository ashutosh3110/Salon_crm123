const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    outletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        sparse: true // Allow null if phone is primary
    },
    phone: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        default: () => Math.random().toString(36).slice(-8).toUpperCase()
    },
    role: {
        type: String
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    },
    dob: String,
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    address: String,
    avatar: String,
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    // Stylist Specific Fields
    bio: String,
    experience: String,
    specializations: [String],
    profileStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Approved'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    availability: {
        mode: { 
            type: String, 
            enum: ['same', 'different'], 
            default: 'same' 
        },
        days: {
            monday: [{ start: String, end: String }],
            tuesday: [{ start: String, end: String }],
            wednesday: [{ start: String, end: String }],
            thursday: [{ start: String, end: String }],
            friday: [{ start: String, end: String }],
            saturday: [{ start: String, end: String }],
            sunday: [{ start: String, end: String }]
        },
        breaks: [{
            start: String, // e.g. "13:00"
            end: String,   // e.g. "14:00"
            label: { type: String, default: 'Lunch' }
        }]
    },
    // HR Related Fields
    hrProfile: {
        joiningDate: Date,
        baseSalary: { type: Number, default: 0 },
        aadhaarNumber: String,
        panNumber: String,
        bankDetails: {
            accountNumber: String,
            ifscCode: String,
            bankName: String,
            holderName: String
        },
        emergencyContact: {
            name: String,
            phone: String,
            relation: String
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
staffSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
staffSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
