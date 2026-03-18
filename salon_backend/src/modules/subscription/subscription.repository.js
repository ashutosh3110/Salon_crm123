import BaseRepository from '../base.repository.js';
import Subscription from './subscription.model.js';

class SubscriptionRepository extends BaseRepository {
    constructor() {
        super(Subscription);
    }
}

export default new SubscriptionRepository();
