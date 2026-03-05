import catalogueRepository from './catalogue.repository.js';

class CatalogueService {
    async createOrUpdateCatalogue(tenantId, catalogueData) {
        const existing = await catalogueRepository.findByTenantId(tenantId);
        if (existing) {
            return catalogueRepository.updateOne({ tenantId }, catalogueData);
        }
        return catalogueRepository.create({ ...catalogueData, tenantId });
    }

    async getCatalogueByTenantId(tenantId) {
        let catalogue = await catalogueRepository.findByTenantId(tenantId);
        if (!catalogue) {
            return null;
        }

        catalogue = catalogue.toObject();

        // Migration logic: If pages are empty but old sections exist
        if ((!catalogue.pages || catalogue.pages.length === 0) && catalogue.sections && catalogue.sections.length > 0) {
            catalogue.pages = [
                {
                    title: 'Home',
                    slug: 'home',
                    icon: 'Layout',
                    sections: catalogue.sections
                }
            ];
        } else if (!catalogue.pages || catalogue.pages.length === 0) {
            // Ensure at least one page exists for new catalogues
            catalogue.pages = [{ title: 'Home', slug: 'home', icon: 'Layout', sections: [] }];
        }

        return catalogue;
    }

    async getPublicCatalogueBySlug(slug) {
        let catalogue = await catalogueRepository.findBySlug(slug);
        if (!catalogue) {
            throw new Error('Catalogue not found or not published');
        }

        catalogue = catalogue.toObject();

        // Migration logic: If pages are empty but old sections exist
        if ((!catalogue.pages || catalogue.pages.length === 0) && catalogue.sections && catalogue.sections.length > 0) {
            catalogue.pages = [
                {
                    title: 'Home',
                    slug: 'home',
                    icon: 'Layout',
                    sections: catalogue.sections
                }
            ];
        } else if (!catalogue.pages || catalogue.pages.length === 0) {
            catalogue.pages = [{ title: 'Home', slug: 'home', icon: 'Layout', sections: [] }];
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
