import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const inquirySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true },
        source: {
            type: String,
            enum: ['Walk-in', 'Phone Call', 'Instagram', 'Facebook', 'WhatsApp', 'Website', 'Referral', 'Other'],
            default: 'Other',
        },
        serviceInterest: { type: String, trim: true },
        notes: { type: String, trim: true },
        status: {
            type: String,
            enum: ['new', 'follow-up', 'converted', 'lost'],
            default: 'new',
        },
        followUpDate: { type: Date, default: null },
        reminderChannel: {
            type: String,
            enum: ['whatsapp', 'none'],
            default: 'whatsapp',
        },
        reminderSentAt: { type: Date, default: null },
    },
    { timestamps: true }
);

inquirySchema.plugin(tenantPlugin);
inquirySchema.index({ tenantId: 1, createdAt: -1 });
inquirySchema.index({ tenantId: 1, status: 1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
