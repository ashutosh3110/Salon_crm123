import catalogueRepository from './catalogue.repository.js';

class CatalogueService {
    async createOrUpdateCatalogue(tenantId, catalogueData) {
        const existing = await catalogueRepository.findByTenantId(tenantId);
        
        // Ensure slug is provided if new
        if (!existing && !catalogueData.slug) {
            catalogueData.slug = `cat-${tenantId.toString().slice(-6)}-${Date.now().toString().slice(-4)}`;
        }
        
        // Ensure title is provided if new
        if (!existing && !catalogueData.title) {
            catalogueData.title = 'Digital Catalogue';
        }

        if (existing) {
            return catalogueRepository.updateOne({ tenantId }, catalogueData);
        }
        return catalogueRepository.create({ ...catalogueData, tenantId });
    }

    async getCatalogueByTenantId(tenantId) {
        return catalogueRepository.findByTenantId(tenantId);
    }

    async getPublicCatalogueBySlug(slug) {
        const catalogue = await catalogueRepository.findBySlug(slug);
        if (!catalogue) {
            throw new Error('Catalogue not found or not published');
        }

        // Increment view count asynchronously
        catalogueRepository.incrementViewCount(slug).catch(console.error);
        return catalogue;
    }

    async togglePublishStatus(tenantId, isPublished) {
        const catalogue = await catalogueRepository.updateOne({ tenantId }, { isPublished });
        if (!catalogue) {
            throw new Error('Catalogue not found');
        }
        return catalogue;
    }
}

export default new CatalogueService();
