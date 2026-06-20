const mongoose = require('mongoose');

const stylistGallerySchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: [true, 'Staff ID is required']
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon',
        required: [true, 'Salon ID is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    tags: [{
        type: String,
        trim: true
    }],
    likes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StylistGallery', stylistGallerySchema);
