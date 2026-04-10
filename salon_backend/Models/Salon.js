const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Salon name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    ownerName: {
        type: String,
        required: [true, 'Owner name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    gstNumber: {
        type: String,
        trim: true
    },
    defaultPassword: {
        type: String,
        default: '123456'
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended'],
        default: 'active'
    }
}, {
    timestamps: true
});

const Salon = mongoose.model('Salon', salonSchema);
module.exports = Salon;
