import tenantRepository from './tenant.repository.js';
import Tenant from './tenant.model.js';

const PLAN_DEFAULTS = {
    free: {
        mrr: 0,
        trialDays: 14,
        features: { pos: true, appointments: true, inventory: false, marketing: false, payroll: false, crm: false, mobileApp: false, reports: false, whatsapp: false, loyalty: false, finance: false, feedback: false },
        limits: { staffLimit: 3, outletLimit: 1, smsCredits: 0, storageGB: 1 }
    },
    basic: {
        mrr: 1999,
        trialDays: 14,
        features: { pos: true, appointments: true, inventory: true, marketing: false, payroll: false, crm: true, mobileApp: false, reports: true, whatsapp: false, loyalty: false, finance: true, feedback: false },
        limits: { staffLimit: 10, outletLimit: 2, smsCredits: 200, storageGB: 5 }
    },
    pro: {
        mrr: 4999,
        trialDays: 7,
        features: { pos: true, appointments: true, inventory: true, marketing: true, payroll: true, crm: true, mobileApp: true, reports: true, whatsapp: false, loyalty: true, finance: true, feedback: true },
        limits: { staffLimit: 25, outletLimit: 5, smsCredits: 1000, storageGB: 20 }
    },
    enterprise: {
        mrr: 12999,
        trialDays: 0,
        features: { pos: true, appointments: true, inventory: true, marketing: true, payroll: true, crm: true, mobileApp: true, reports: true, whatsapp: true, loyalty: true, finance: true, feedback: true },
        limits: { staffLimit: 999, outletLimit: 999, smsCredits: 10000, storageGB: 100 }
    }
};

class TenantService {
    async createTenant(tenantData) {
        // Generate slug if not provided
        if (!tenantData.slug && tenantData.name) {
            tenantData.slug = tenantData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        }

        if (await tenantRepository.findBySlug(tenantData.slug)) {
            tenantData.slug = `${tenantData.slug}-${Math.floor(Math.random() * 1000)}`;
        }

        // Apply plan defaults if plan is provided
        const plan = tenantData.subscriptionPlan || 'free';
        if (PLAN_DEFAULTS[plan]) {
            tenantData.features = { ...PLAN_DEFAULTS[plan].features, ...(tenantData.features || {}) };
            tenantData.limits = { ...PLAN_DEFAULTS[plan].limits, ...(tenantData.limits || {}) };
            tenantData.mrr = PLAN_DEFAULTS[plan].mrr;
            tenantData.trialDays = PLAN_DEFAULTS[plan].trialDays;
        }

        // Check for duplicate email
        if (tenantData.email) {
            const existingEmail = await tenantRepository.findOne({ email: tenantData.email.toLowerCase() });
            if (existingEmail) throw new Error('Email already registered for another salon');
        }

        // Check for duplicate GST
        if (tenantData.gstNumber) {
            const existingGst = await tenantRepository.findOne({ gstNumber: tenantData.gstNumber });
            if (existingGst) throw new Error('GST Number already registered for another salon');
        }

        return tenantRepository.create(tenantData);
    }

    async getTenantById(id) {
        const tenant = await tenantRepository.findOne({ _id: id });
        if (!tenant) throw new Error('Tenant not found');
        return tenant;
    }

    async getTenantBySlug(slug) {
        const tenant = await tenantRepository.findBySlug(slug);
        if (!tenant) throw new Error('Tenant not found');
        return tenant;
    }

    async queryTenants(filter, options) {
        return tenantRepository.find(filter, options);
    }

    async updateTenantById(id, updateBody) {
        const tenant = await this.getTenantById(id);
        
        // Handle deep update for features and limits if they exist
        if (updateBody.features) {
            updateBody.features = { ...tenant.features.toObject(), ...updateBody.features };
        }
        if (updateBody.limits) {
            updateBody.limits = { ...tenant.limits.toObject(), ...updateBody.limits };
        }

        // Duplicate checks for update
        if (updateBody.email && updateBody.email.toLowerCase() !== tenant.email.toLowerCase()) {
            const existing = await tenantRepository.findOne({ email: updateBody.email.toLowerCase(), _id: { $ne: id } });
            if (existing) throw new Error('Email already taken by another salon');
        }

        if (updateBody.gstNumber && updateBody.gstNumber !== tenant.gstNumber) {
            const existing = await tenantRepository.findOne({ gstNumber: updateBody.gstNumber, _id: { $ne: id } });
            if (existing) throw new Error('GST Number already registered by another salon');
        }

        Object.assign(tenant, updateBody);
        await tenant.save();
        return tenant;
    }

    async deleteTenantById(id) {
        const tenant = await this.getTenantById(id);
        tenant.status = 'suspended';
        await tenant.save();
        return tenant;
    }

    async getTenantStats() {
        // Aggregating for dashboard KPIs
        const stats = await Tenant.aggregate([
            {
                $facet: {
                    statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
                    planCounts: [{ $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }],
                    revenueStats: [{ $group: { _id: null, totalMRR: { $sum: '$mrr' }, totalRevenue: { $sum: '$totalRevenue' } } }],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ]);

        const facet = stats[0];
        const byStatus = {};
        facet.statusCounts.forEach(s => { byStatus[s._id] = s.count; });

        const byPlan = {};
        facet.planCounts.forEach(p => { byPlan[p._id] = p.count; });

        const recentTenants = await Tenant.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name slug status subscriptionPlan createdAt ownerName email')
            .lean();

        return {
            totalSalons: facet.totalCount[0]?.count || 0,
            activeSalons: byStatus.active || 0,
            currentMonthlyRevenue: facet.revenueStats[0]?.totalMRR || 0,
            totalRevenue: facet.revenueStats[0]?.totalRevenue || 0,
            countsByStatus: facet.statusCounts,
            countsByPlan: facet.planCounts,
            recentTenants,
        };
    }
}

export default new TenantService();
