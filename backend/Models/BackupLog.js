const mongoose = require('mongoose');

const backupLogSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['success', 'failed'],
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ipAddress: {
        type: String,
        default: 'unknown'
    },
    errorMessage: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BackupLog', backupLogSchema);
