import BaseRepository from '../base.repository.js';
import Tenant from './tenant.model.js';

class TenantRepository extends BaseRepository {
    constructor() {
        super(Tenant);
    }

    async findBySlug(slug) {
        return this.findOne({ slug });
    }
}

export default new TenantRepository();
