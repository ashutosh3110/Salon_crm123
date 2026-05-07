const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        default: null // null = global CMS
    },
    section: {
        type: String,
        required: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness per tenant
cmsSchema.index({ tenantId: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Cms', cmsSchema);
