import mongoose from 'mongoose';
import tenantPlugin from '../../utils/tenant.plugin.js';

const catalogueSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
        },
        coverImage: {
            type: String,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        pages: [
            {
                title: { type: String, required: true },
                slug: { type: String, required: true },
                icon: { type: String },
                sections: [
                    {
                        title: { type: String, required: true },
                        items: [
                            {
                                type: { type: String, enum: ['service', 'product'], required: true },
                                refId: { type: mongoose.Schema.Types.ObjectId, required: true },
                                displayName: { type: String, required: true },
                                price: { type: Number },
                                imageUrl: { type: String },
                                highlight: { type: Boolean, default: false },
                            }
                        ]
                    }
                ]
            }
        ],
        // Deprecated: Moving to pages structure
        sections: [
            {
                title: { type: String, required: true },
                items: [
                    {
                        type: { type: String, enum: ['service', 'product'], required: true },
                        refId: { type: mongoose.Schema.Types.ObjectId, required: true },
                        displayName: { type: String, required: true },
                        price: { type: Number },
                        imageUrl: { type: String },
                        highlight: { type: Boolean, default: false },
                    }
                ]
            }
        ],
        socialLinks: {
            instagram: { type: String },
            facebook: { type: String },
            whatsapp: { type: String },
            website: { type: String },
        },
        theme: {
            primaryColor: { type: String, default: '#AD0B2A' },
            fontStyle: { type: String, default: 'Inter' },
            layout: { type: String, enum: ['grid', 'list'], default: 'grid' },
        },
        viewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

catalogueSchema.plugin(tenantPlugin);

// Ensure one catalogue per tenant
catalogueSchema.index({ tenantId: 1 }, { unique: true });

const Catalogue = mongoose.model('Catalogue', catalogueSchema);

export default Catalogue;
