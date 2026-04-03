import mongoose from 'mongoose';

const cancellationFeedbackSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
        },
        plan: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            enum: ['too_expensive', 'missing_features', 'going_offline', 'competitor', 'other'],
            required: true,
        },
        comment: {
            type: String,
            trim: true,
        },
        cancelledAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for analytics performance
cancellationFeedbackSchema.index({ reason: 1 });
cancellationFeedbackSchema.index({ cancelledAt: 1 });

const CancellationFeedback = mongoose.model('CancellationFeedback', cancellationFeedbackSchema);

export default CancellationFeedback;
