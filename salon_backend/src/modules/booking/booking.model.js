import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const bookingSchema = new mongoose.Schema(
    {
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
        },
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        duration: {
            type: Number, // in minutes
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            default: 'pending',
        },
        notes: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Plugin to handle tenant isolation
bookingSchema.plugin(tenantPlugin);

// Prevent double booking for the same staff at the same time
// This index helps but specific logic will be in the service
bookingSchema.index({ staffId: 1, appointmentDate: 1, tenantId: 1 }, { unique: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
