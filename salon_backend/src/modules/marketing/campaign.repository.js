import BaseRepository from '../base.repository.js';
import Campaign from './campaign.model.js';

class CampaignRepository extends BaseRepository {
    constructor() {
        super(Campaign);
    }
}

export default new CampaignRepository();
