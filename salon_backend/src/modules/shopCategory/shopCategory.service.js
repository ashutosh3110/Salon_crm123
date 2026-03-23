import shopCategoryRepository from './shopCategory.repository.js';

class ShopCategoryService {
    async list(tenantId, options = {}) {
        return shopCategoryRepository.find(
            { tenantId },
            { limit: options.limit || 200, sort: { sortOrder: 1, name: 1 }, page: options.page || 1 }
        );
    }

    async create(tenantId, body) {
        return shopCategoryRepository.create({ ...body, tenantId });
    }

    async updateById(tenantId, id, body) {
        return shopCategoryRepository.updateOne({ _id: id, tenantId }, body);
    }

    async deleteById(tenantId, id) {
        return shopCategoryRepository.deleteOne({ _id: id, tenantId });
    }
}

export default new ShopCategoryService();
