import mongoose from 'mongoose';

const appCmsSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            unique: true,
        },
        banners: {
            type: Array,
            default: [],
        },
        offers: {
            type: Array,
            default: [],
        },
        lookbook: {
            type: Array,
            default: [],
        },
    },
    { timestamps: true }
);

appCmsSchema.index({ tenantId: 1 });

const AppCMS = mongoose.model('AppCMS', appCmsSchema);
export default AppCMS;
