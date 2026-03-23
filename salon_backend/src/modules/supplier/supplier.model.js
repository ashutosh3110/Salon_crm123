import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const supplierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        contact: {
            type: String,
            trim: true,
            default: '',
        },
        gstin: {
            type: String,
            trim: true,
            default: '',
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: '',
        },
        address: {
            type: String,
            trim: true,
            default: '',
        },
        /** Outstanding payable to supplier (manual / future AP integration) */
        due: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ['Active', 'Overdue', 'Inactive'],
            default: 'Active',
        },
    },
    {
        timestamps: true,
    }
);

supplierSchema.plugin(tenantPlugin);

supplierSchema.index({ tenantId: 1, name: 1 });

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;
