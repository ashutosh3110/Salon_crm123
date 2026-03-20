import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const bridalReminderSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        label: { type: String, required: true },
        daysBefore: { type: Number, required: true },
        active: { type: Boolean, default: true },
        sentAt: { type: Date, default: null },
    },
    { _id: false }
);

const bridalBookingSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        clientName: { type: String, required: true, trim: true },
        clientPhone: { type: String, required: true, trim: true },
        eventName: { type: String, required: true, trim: true },
        eventDate: { type: Date, required: true },
        service: { type: String, trim: true },
        reminders: { type: [bridalReminderSchema], default: [] },
    },
    { _id: false }
);

const reminderRuleSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        category: { type: String, required: true, trim: true },
        interval: { type: Number, required: true },
        channel: { type: String, enum: ['WhatsApp', 'Email', 'SMS'], default: 'WhatsApp' },
        message: { type: String, required: true },
        active: { type: Boolean, default: true },
    },
    { _id: false }
);

const reminderLinkSchema = new mongoose.Schema(
    {
        bridalBookings: { type: [bridalBookingSchema], default: [] },
        reminderRules: { type: [reminderRuleSchema], default: [] },
        bookingSettings: {
            salonSlug: { type: String, default: 'premium-salon' },
            welcomeMsg: { type: String, default: 'Welcome to our premium salon. Book your next visit below.' },
            showServices: { type: Boolean, default: true },
        },
        serviceReminderStates: [
            {
                clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
                ruleId: { type: String, required: true },
                ignoredUntil: { type: Date, default: null },
                repliedAt: { type: Date, default: null },
                lastSentAt: { type: Date, default: null },
            },
        ],
    },
    { timestamps: true }
);

reminderLinkSchema.plugin(tenantPlugin);
reminderLinkSchema.index({ tenantId: 1 }, { unique: true });

const ReminderLink = mongoose.model('ReminderLink', reminderLinkSchema);
export default ReminderLink;
