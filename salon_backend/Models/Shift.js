const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    name: {
        type: String,
        required: true, // e.g. Morning, Evening
        trim: true
    },
    startTime: {
        type: String, // e.g. "09:00"
        required: true
    },
    endTime: {
        type: String, // e.g. "17:00"
        required: true
    },
    colorClass: {
        type: String,
        default: 'bg-emerald-500'
    },
    colorHex: {
        type: String,
        default: '#10b981'
    },
    assignedStaff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    }],
    description: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Shift', shiftSchema);
