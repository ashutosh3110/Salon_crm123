const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required']
    },
    answer: {
        type: String,
        required: [true, 'Answer is required']
    },
    category: {
        type: String,
        default: 'General'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Faq', faqSchema);
