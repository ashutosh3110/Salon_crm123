import AppCMS from './appCms.model.js';
import User from '../user/user.model.js';

const resolveTenantId = async (user) => {
    let tid = user?.tenantId || null;
    if (!tid && user?._id) {
        const tenantService = (await import('../tenant/tenant.service.js')).default;
        const byOwner = await tenantService.queryTenants({ owner: user._id }, { page: 1, limit: 1 });
        tid = byOwner?.results?.[0]?._id || null;
    }
    if (!tid && user?.email) {
        const tenantService = (await import('../tenant/tenant.service.js')).default;
        const byEmail = await tenantService.queryTenants({ email: String(user.email).toLowerCase() }, { page: 1, limit: 1 });
        tid = byEmail?.results?.[0]?._id || null;
    }
    return tid;
};

const getAppCMS = async (tenantId) => {
    let doc = await AppCMS.findOne({ tenantId }).lean();
    if (!doc) {
        doc = await AppCMS.create({ tenantId, banners: [], offers: [], lookbook: [] });
    }
    return {
        banners: doc.banners || [],
        offers: doc.offers || [],
        lookbook: doc.lookbook || [],
    };
};

const updateAppCMSSection = async (tenantId, section, content) => {
    if (!['banners', 'offers', 'lookbook'].includes(section)) {
        throw new Error('Invalid section');
    }
    if (!Array.isArray(content)) {
        throw new Error('Content must be an array');
    }
    let doc = await AppCMS.findOne({ tenantId });
    if (!doc) {
        doc = await AppCMS.create({ tenantId, banners: [], offers: [], lookbook: [] });
    }
    doc[section] = Array.isArray(content) ? content : [];
    doc.markModified(section);
    await doc.save();
    return { banners: doc.banners, offers: doc.offers, lookbook: doc.lookbook };
};

const getExpertsFromStaff = async (tenantId) => {
    const staff = await User.find({
        tenantId,
        role: { $in: ['stylist', 'manager', 'admin'] },
        status: 'active',
    })
        .select('name email role specialist outletId')
        .populate('outletId', 'name')
        .lean();

    const defaultImg = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80';
    return staff.map((s, i) => ({
        id: s._id?.toString() || `expert-${i}`,
        _id: s._id,
        userId: s._id,
        name: s.name,
        role: s.specialist || s.role || 'Stylist',
        img: defaultImg,
        experience: '—',
        bio: '',
        specializations: s.specialist ? [s.specialist] : [],
        status: 'Approved',
        clients: '—',
        outletId: s.outletId?._id,
        outletName: s.outletId?.name,
    }));
};

export default {
    getAppCMS,
    updateAppCMSSection,
    getExpertsFromStaff,
    resolveTenantId,
};
