import tenantRepository from './tenant.repository.js';
import Tenant from './tenant.model.js';

class TenantService {
    async createTenant(tenantData) {
        if (await tenantRepository.findBySlug(tenantData.slug)) {
            throw new Error('Tenant slug already exists');
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
        const [statusCounts, planCounts, totalCount, recentTenants] = await Promise.all([
            Tenant.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Tenant.aggregate([
                { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }
            ]),
            Tenant.countDocuments(),
            Tenant.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name slug status subscriptionPlan createdAt')
                .lean()
        ]);

        const byStatus = {};
        statusCounts.forEach(s => { byStatus[s._id] = s.count; });

        const byPlan = {};
        planCounts.forEach(p => { byPlan[p._id] = p.count; });

        return {
            total: totalCount,
            byStatus,
            byPlan,
            recentTenants,
        };
    }
}

export default new TenantService();
