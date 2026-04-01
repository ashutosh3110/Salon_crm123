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
        // Support for "Catalogue Pro" full state
        premiumLanding: {
            type: mongoose.Schema.Types.Mixed,
        },
        pages: {
            type: mongoose.Schema.Types.Mixed,
        },
        theme: {
            type: mongoose.Schema.Types.Mixed,
        },
        // Keeping legacy socialLinks for backward compatibility if needed
        socialLinks: {
            instagram: { type: String },
            facebook: { type: String },
            whatsapp: { type: String },
            website: { type: String },
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
// Index for fast lookups (tenantId is already unique in field definition)

const Catalogue = mongoose.model('Catalogue', catalogueSchema);

export default Catalogue;
