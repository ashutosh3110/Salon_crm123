import Inquiry from './inquiry.model.js';

class InquiryService {
    async createInquiry(tenantId, payload) {
        return Inquiry.create({ ...payload, tenantId });
    }

    async queryInquiries(tenantId, filter = {}, options = {}) {
        const query = { tenantId };
        if (filter.search) {
            const s = String(filter.search);
            query.$or = [
                { name: { $regex: s, $options: 'i' } },
                { phone: { $regex: s, $options: 'i' } },
                { serviceInterest: { $regex: s, $options: 'i' } },
            ];
        }
        if (filter.source) query.source = filter.source;
        if (filter.status) query.status = filter.status;

        const page = Math.max(1, Number(options.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(options.limit) || 50));
        const skip = (page - 1) * limit;

        const [results, total] = await Promise.all([
            Inquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Inquiry.countDocuments(query),
        ]);

        return { results, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
    }

    async getInquiryById(tenantId, inquiryId) {
        return Inquiry.findOne({ _id: inquiryId, tenantId });
    }

    async updateInquiryById(tenantId, inquiryId, payload) {
        return Inquiry.findOneAndUpdate({ _id: inquiryId, tenantId }, payload, { new: true });
    }

    async deleteInquiryById(tenantId, inquiryId) {
        return Inquiry.findOneAndDelete({ _id: inquiryId, tenantId });
    }

    async processDueFollowUps(tenantId) {
        const now = new Date();
        const due = await Inquiry.find({
            tenantId,
            status: { $in: ['new', 'follow-up'] },
            reminderChannel: 'whatsapp',
            followUpDate: { $ne: null, $lte: now },
            $or: [{ reminderSentAt: null }, { reminderSentAt: { $lt: now } }],
        }).limit(200);

        // Placeholder for WhatsApp integration. Mark as sent now.
        const ids = due.map((d) => d._id);
        if (ids.length > 0) {
            await Inquiry.updateMany({ _id: { $in: ids } }, { $set: { reminderSentAt: now } });
        }
        return { dueCount: ids.length, sentCount: ids.length };
    }
}

export default new InquiryService();
