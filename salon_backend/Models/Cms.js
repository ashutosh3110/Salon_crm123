const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cms', cmsSchema);
