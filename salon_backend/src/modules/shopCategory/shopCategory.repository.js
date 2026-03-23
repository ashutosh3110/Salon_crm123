import BaseRepository from '../base.repository.js';
import ShopCategory from './shopCategory.model.js';

class ShopCategoryRepository extends BaseRepository {
    constructor() {
        super(ShopCategory);
    }
}

export default new ShopCategoryRepository();
