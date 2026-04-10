const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Role name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    permissions: [{
        type: String,
        trim: true
    }],
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure role names are unique per salon
roleSchema.index({ salonId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
