import BaseRepository from '../base.repository.js';
import User from './user.model.js';

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findByEmail(email) {
        return this.findOne({ email });
    }

    async findByTenant(tenantId, options) {
        return this.find({ tenantId }, options);
    }
}

export default new UserRepository();
