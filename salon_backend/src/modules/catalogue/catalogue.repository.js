import BaseRepository from '../base.repository.js';
import Catalogue from './catalogue.model.js';

class CatalogueRepository extends BaseRepository {
    constructor() {
        super(Catalogue);
    }

    async findBySlug(slug) {
        return this.model.findOne({ slug, isPublished: true });
    }

    async findByTenantId(tenantId) {
        return this.model.findOne({ tenantId });
    }

    async incrementViewCount(slug) {
        return this.model.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } }, { new: true });
    }
}

export default new CatalogueRepository();
