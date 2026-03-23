import mongoose from 'mongoose';
import Feedback from './feedback.model.js';

function computeSentiment(rating) {
    const r = Number(rating);
    if (r >= 4) return 'Positive';
    if (r === 3) return 'Neutral';
    return 'Negative';
}

function computeStatus(rating) {
    const r = Number(rating);
    return r <= 2 ? 'Urgent' : 'Pending';
}

const feedbackService = {
    async createFeedback({ tenantId, customerId, customerName, rating, comment, service, staffName, images }) {
        const created = await Feedback.create({
            tenantId,
            customerId,
            customerName: customerName || '',
            rating: Number(rating),
            comment: comment || '',
            service: service || '',
            staffName: staffName || '',
            images: Array.isArray(images) ? images : [],
            response: '',
            status: computeStatus(rating),
            sentiment: computeSentiment(rating),
        });
        return created;
    },

    async listFeedbacks(tenantId, { status, rating } = {}) {
        const filter = { tenantId };
        if (status) filter.status = status;
        if (rating) filter.rating = Number(rating);

        const list = await Feedback.find(filter)
            .sort({ createdAt: -1 })
            .lean();
        return list;
    },

    async updateFeedback(tenantId, feedbackId, { response, status }) {
        const update = {};
        if (response !== undefined) update.response = response;
        if (status !== undefined) update.status = status;

        const updated = await Feedback.findOneAndUpdate(
            { tenantId, _id: new mongoose.Types.ObjectId(feedbackId) },
            { $set: update },
            { new: true }
        ).lean();

        return updated;
    },

    async archiveFeedback(tenantId, feedbackId) {
        const updated = await Feedback.findOneAndUpdate(
            { tenantId, _id: new mongoose.Types.ObjectId(feedbackId) },
            { status: 'Archived' },
            { new: true }
        ).lean();

        return updated;
    },
};

export default feedbackService;

