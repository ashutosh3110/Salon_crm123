import productService from './product.repository.js'; // Use repository directly if service is simple, but we had a service in mind
import cacheService from '../../utils/cache.service.js';

class ProductService {
    async createProduct(tenantId, productData) {
        const product = await productService.create({ ...productData, tenantId });
        await cacheService.del(cacheService.generateKey(tenantId, 'products', 'list'));
        return product;
    }

    async queryProducts(tenantId, filter, options) {
        const cacheKey = cacheService.generateKey(tenantId, 'products', 'list');
        const isDefault = Object.keys(filter).length === 0 && options.page === 1;

        if (isDefault) {
            const cached = await cacheService.get(cacheKey);
            if (cached) return cached;
        }

        const result = await productService.find({ ...filter, tenantId }, options);

        if (isDefault) {
            await cacheService.set(cacheKey, result, 300);
        }
        return result;
    }

    async getProductById(tenantId, productId) {
        const product = await productService.findOne({ _id: productId, tenantId });
        if (!product) throw new Error('Product not found');
        return product;
    }
}

export default new ProductService();
