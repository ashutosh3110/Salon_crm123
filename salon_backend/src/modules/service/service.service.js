import serviceRepository from './service.repository.js';
import cacheService from '../../utils/cache.service.js';

class ServiceCatalogService {
    async createService(tenantId, serviceData) {
        const service = await serviceRepository.create({ ...serviceData, tenantId });
        // Invalidate cache on change
        await cacheService.del(cacheService.generateKey(tenantId, 'services', 'list'));
        return service;
    }

    async queryServices(tenantId, filter, options) {
        const cacheKey = cacheService.generateKey(tenantId, 'services', 'list');

        // Only cache if it's a default list query (page 1, no filters)
        const isDefaultQuery = Object.keys(filter).length === 0 && options.page === 1;

        if (isDefaultQuery) {
            const cachedData = await cacheService.get(cacheKey);
            if (cachedData) return cachedData;
        }

        const result = await serviceRepository.find({ ...filter, tenantId }, options);

        if (isDefaultQuery) {
            await cacheService.set(cacheKey, result, 300); // Cache for 5 mins
        }

        return result;
    }

    async getServiceById(tenantId, serviceId) {
        const service = await serviceRepository.findOne({ _id: serviceId, tenantId });
        if (!service) throw new Error('Service not found');
        return service;
    }
}

export default new ServiceCatalogService();
