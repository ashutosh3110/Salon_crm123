import BaseRepository from '../base.repository.js';
import Promotion from './promotion.model.js';

class PromotionRepository extends BaseRepository {
    constructor() {
        super(Promotion);
    }

    async findActivePromotions(tenantId) {
        const now = new Date();
        return this.model.find({
            tenantId,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        });
    }
}

export default new PromotionRepository();
