const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'Subject is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'closed', 'escalated'],
        default: 'pending'
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: false
    },
    outletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet',
        required: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: false
    },
    category: {
        type: String,
        default: 'General Inquiry'
    },
    responses: [{
        message: String,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
