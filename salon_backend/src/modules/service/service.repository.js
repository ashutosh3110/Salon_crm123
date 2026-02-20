import httpStatus from 'http-status-codes';
import BaseRepository from '../base.repository.js';
import Service from './service.model.js';

class ServiceRepository extends BaseRepository {
    constructor() {
        super(Service);
    }
}

export default new ServiceRepository();
