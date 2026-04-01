import Lead from './lead.model.js';
import notificationService from '../notification/notification.service.js';
import User from '../user/user.model.js';

const createLead = async (leadBody) => {
    const lead = await Lead.create(leadBody);

    // --- Notification Trigger for Superadmins ---
    try {
        const superAdmins = await User.find({ role: 'superadmin' }).select('_id email status');
        const saIds = superAdmins.map(sa => sa._id);
        
        if (saIds.length > 0) {
            await notificationService.sendToMany(saIds, {
                type: 'inquiry_new',
                title: 'New Website Lead 🚀',
                body: `${leadBody.name || 'A customer'} is interested in: ${leadBody.salonName || 'Wapixo'}`,
                actionUrl: '/superadmin/inquiries',
                data: { leadId: lead._id.toString() }
            });
            console.log(`[LeadService] FCM Push sent to ${saIds.length} Superadmins for new lead`);
        }
    } catch (err) {
        console.warn('[LeadService] Notification failed:', err.message);
    }

    return lead;
};

const queryLeads = async (filter, options) => {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (filter.status) query.status = filter.status;
    if (filter.search) {
        query.$or = [
            { name: { $regex: filter.search, $options: 'i' } },
            { email: { $regex: filter.search, $options: 'i' } },
            { message: { $regex: filter.search, $options: 'i' } },
        ];
    }

    const [results, totalResults] = await Promise.all([
        Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Lead.countDocuments(query),
    ]);

    return {
        results,
        page,
        limit,
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
    };
};

const updateLeadById = async (id, updateBody) => {
    const lead = await Lead.findByIdAndUpdate(id, updateBody, { new: true });
    return lead;
};

const deleteLeadById = async (id) => {
    const lead = await Lead.findByIdAndDelete(id);
    return lead;
};

export default {
    createLead,
    queryLeads,
    updateLeadById,
    deleteLeadById,
};
