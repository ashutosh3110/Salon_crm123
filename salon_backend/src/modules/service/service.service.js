import serviceRepository from './service.repository.js';
import Category from './category.model.js';
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

    async updateServiceById(tenantId, serviceId, updateBody) {
        const service = await this.getServiceById(tenantId, serviceId);
        Object.assign(service, updateBody);
        await service.save();
        await cacheService.del(cacheService.generateKey(tenantId, 'services', 'list'));
        return service;
    }

    async deleteServiceById(tenantId, serviceId) {
        const service = await this.getServiceById(tenantId, serviceId);
        await (service.remove ? service.remove() : service.deleteOne());
        await cacheService.del(cacheService.generateKey(tenantId, 'services', 'list'));
        return service;
    }

    // Category Methods
    async queryCategories(tenantId) {
        return Category.find({ tenantId });
    }

    async createCategory(tenantId, categoryData) {
        const category = await Category.create({ ...categoryData, tenantId });
        return category;
    }

    async updateCategoryById(tenantId, categoryId, updateBody) {
        const category = await Category.findOne({ _id: categoryId, tenantId });
        if (!category) throw new Error('Category not found');
        Object.assign(category, updateBody);
        await category.save();
        return category;
    }

    async deleteCategoryById(tenantId, categoryId) {
        const category = await Category.findOne({ _id: categoryId, tenantId });
        if (!category) throw new Error('Category not found');
        await (category.remove ? category.remove() : category.deleteOne());
        return category;
    }
}

export default new ServiceCatalogService();
