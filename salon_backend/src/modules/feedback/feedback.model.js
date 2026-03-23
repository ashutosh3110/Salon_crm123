import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const feedbackSchema = new mongoose.Schema(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
        customerName: { type: String, trim: true, default: '' },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, trim: true, default: '' },

        service: { type: String, trim: true, default: '' },
        staffName: { type: String, trim: true, default: '' },
        images: { type: [String], default: [] },

        response: { type: String, trim: true, default: '' },

        // Pending/Urgent/Resolved/Archived (UI expects Archived filtering)
        status: {
            type: String,
            enum: ['Pending', 'Urgent', 'Resolved', 'Archived'],
            default: 'Pending',
        },

        sentiment: { type: String, trim: true, default: '' }, // Positive/Neutral/Negative
    },
    { timestamps: true }
);

feedbackSchema.plugin(tenantPlugin);

feedbackSchema.index({ tenantId: 1, createdAt: -1 });
feedbackSchema.index({ tenantId: 1, status: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;

