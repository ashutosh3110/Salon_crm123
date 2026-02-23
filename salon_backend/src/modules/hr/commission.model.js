import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const commissionSchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        invoiceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Invoice',
            required: true,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
        },
        amount: {
            type: Number,
            required: true,
        },
        baseAmount: {
            type: Number,
            required: true,
        },
        percentage: {
            type: Number,
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'cancelled'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

commissionSchema.plugin(tenantPlugin);

const Commission = mongoose.model('Commission', commissionSchema);

export default Commission;
