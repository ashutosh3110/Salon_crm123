import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        category: {
            type: String,
            required: true,
            enum: ["Growth", "Marketing", "Operations", "Insights", "Product"],
        },
        excerpt: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            default: "https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200",
        },
        status: {
            type: String,
            required: true,
            enum: ['published', 'draft'],
            default: 'draft',
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        author: {
            type: String,
            default: "Wapixo HQ",
        },
        reads: {
            type: Number,
            default: 0,
        },
        seoTitle: {
            type: String,
            trim: true,
        },
        seoDescription: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
