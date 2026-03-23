import BaseRepository from '../base.repository.js';
import Promotion from './promotion.model.js';

class PromotionRepository extends BaseRepository {
    constructor() {
        super(Promotion);
    }

    async findActivePromotions(tenantId) {
        const now = new Date();
        // Treat dates as inclusive by comparing using "date-only" (00:00) boundary.
        // This prevents "endDate today" promos from becoming inactive after midnight.
        const nowDateOnly = new Date(now);
        nowDateOnly.setHours(0, 0, 0, 0);
        return this.model.find({
            tenantId,
            isActive: true,
            startDate: { $lte: nowDateOnly },
            endDate: { $gte: nowDateOnly },
        });
    }
}

export default new PromotionRepository();
