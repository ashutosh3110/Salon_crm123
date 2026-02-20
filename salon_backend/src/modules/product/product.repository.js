import BaseRepository from '../base.repository.js';
import Product from './product.model.js';

class ProductRepository extends BaseRepository {
    constructor() {
        super(Product);
    }
}

export default new ProductRepository();
