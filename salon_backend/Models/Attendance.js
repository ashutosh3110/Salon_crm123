const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    outletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet'
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half-day', 'leave'],
        default: 'present'
    },
    checkIn: String,
    checkOut: String,
    notes: String,
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index to ensure unique attendance per staff per day
attendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
