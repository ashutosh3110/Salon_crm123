const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200'
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    author: {
        type: String,
        default: 'Wapixo HQ'
    },
    reads: {
        type: Number,
        default: 0
    },
    seoDescription: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
