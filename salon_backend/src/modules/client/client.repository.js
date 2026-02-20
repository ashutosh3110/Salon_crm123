import BaseRepository from '../base.repository.js';
import Client from './client.model.js';

class ClientRepository extends BaseRepository {
    constructor() {
        super(Client);
    }

    async findByPhone(tenantId, phone) {
        return this.findOne({ tenantId, phone });
    }
}

export default new ClientRepository();
