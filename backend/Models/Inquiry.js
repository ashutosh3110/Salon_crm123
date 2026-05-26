const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon'
    },
    outletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet'
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Mobile number is required'],
        trim: true
    },
    salonName: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        trim: true
    },
    message: {
        type: String
    },
    interestedService: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    serviceInterest: {
        type: String,
        trim: true
    },
    visitType: {
        type: String,
        enum: ['Call', 'Walk-in', 'WhatsApp', 'Social Media Inquiry', 'Other'],
        default: 'Walk-in'
    },
    source: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    remarks: {
        type: String,
        trim: true
    },
    staffAssigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    followUpDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['new', 'follow-up', 'interested', 'not-interested', 'converted', 'lost'],
        default: 'new'
    }
}, {
    timestamps: true
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);
module.exports = Inquiry;
