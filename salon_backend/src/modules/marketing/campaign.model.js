import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const campaignSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['bulk', 'segmented'],
            default: 'bulk',
        },
        segment: {
            type: String,
            trim: true,
            default: 'all',
        },
        message: {
            type: String,
            trim: true,
            default: '',
        },
        channel: {
            type: String,
            enum: ['whatsapp', 'email'],
            default: 'whatsapp',
        },
        status: {
            type: String,
            enum: ['draft', 'pending', 'sending', 'completed', 'scheduled', 'failed'],
            default: 'draft',
        },
        sentCount: { type: Number, default: 0 },
        readCount: { type: Number, default: 0 },
        targetCount: { type: Number, default: 0 },
        scheduledAt: { type: Date, default: null },
        sentAt: { type: Date, default: null },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

campaignSchema.plugin(tenantPlugin);
campaignSchema.index({ tenantId: 1, createdAt: -1 });
campaignSchema.index({ tenantId: 1, status: 1 });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
