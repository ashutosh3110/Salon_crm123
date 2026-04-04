import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ['Billing', 'Technical Issue', 'Feature Request', 'General Inquiry', 'Account Access'],
            required: true,
        },
        status: {
            type: String,
            enum: ['open', 'in-progress', 'resolved', 'escalated', 'closed'],
            default: 'open',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // required: true, // Making it optional for customers who don't have a User record
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client', // For Customer App tickets
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
        },
        outletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet',
        },
        attachments: [{
            type: String,
        }],
        creatorRole: {
            type: String,
        },
        responses: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            message: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
    },
    {
        timestamps: true,
    }
);

// Add index for faster searching
supportTicketSchema.index({ tenantId: 1, status: 1 });
supportTicketSchema.index({ userId: 1 });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
