import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        salonName: { type: String, trim: true },
        phone: { type: String, trim: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ['new', 'contacted', 'archived'],
            default: 'new',
        },
    },
    { timestamps: true }
);

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
