const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Automatically delete at the expiresAt time
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Otp', otpSchema);
