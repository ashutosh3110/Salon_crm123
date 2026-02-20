import tenantRepository from './tenant.repository.js';
import httpStatus from 'http-status-codes';

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
}

export default new TenantService();
