import Lead from './lead.model.js';

const createLead = async (leadBody) => {
    return Lead.create(leadBody);
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
