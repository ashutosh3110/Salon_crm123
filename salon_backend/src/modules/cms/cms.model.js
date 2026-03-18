import mongoose from 'mongoose';

const cmsSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
}, {
    timestamps: true,
});

const CMS = mongoose.model('CMS', cmsSchema);

export default CMS;
