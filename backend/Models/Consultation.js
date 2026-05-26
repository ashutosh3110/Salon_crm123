const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Please specify the customer']
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    outletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet',
        required: [true, 'Please specify the outlet']
    },
    title: {
        type: String,
        required: [true, 'Please specify a consultation title'],
        trim: true
    },
    notes: {
        type: String,
        required: [true, 'Consultation / problem notes are required']
    },
    solution: {
        type: String,
        required: [true, 'Solution / recommendation notes are required']
    },
    adminNotes: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
    },
    followUpDate: {
        type: Date
    },
    attachment: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);
