const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    breaks: [{
        start: { type: String, required: true }, // e.g. "13:00"
        end: { type: String, required: true },   // e.g. "13:30"
        description: String
    }]
}, {
    timestamps: true
});

// Index for fast lookup
breakSchema.index({ staffId: 1, date: 1 });

module.exports = mongoose.model('Break', breakSchema);
