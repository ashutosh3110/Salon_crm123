import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        /** Who receives this notification */
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        /** 'user' for staff/admin, 'client' for customer app */
        recipientType: {
            type: String,
            enum: ['user', 'client'],
            default: 'user',
        },
        /** Scoped to tenant (null for superadmin notifications) */
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            index: true,
        },
        /** Notification category */
        type: {
            type: String,
            enum: [
                'booking_new',
                'booking_confirmed',
                'booking_cancelled',
                'booking_reminder',
                'pos_checkout',
                'inventory_low',
                'inquiry_new',
                'subscription_expiring',
                'payment_received',
                'payment_failed',
                'staff_attendance',
                'general',
            ],
            default: 'general',
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        body: {
            type: String,
            required: true,
            trim: true,
        },
        /** Additional data payload (e.g., booking ID, invoice number) */
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        /** Whether the user has read this notification */
        isRead: {
            type: Boolean,
            default: false,
        },
        /** Whether push was successfully sent */
        pushSent: {
            type: Boolean,
            default: false,
        },
        /** Click action URL (frontend route) */
        actionUrl: {
            type: String,
            trim: true,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ tenantId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
