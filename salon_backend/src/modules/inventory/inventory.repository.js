import BaseRepository from '../base.repository.js';
import Inventory from './inventory.model.js';

class InventoryRepository extends BaseRepository {
    constructor() {
        super(Inventory);
    }

    async findStock(productId, outletId, tenantId) {
        return this.model.findOne({ productId, outletId, tenantId });
    }
}

export default new InventoryRepository();
