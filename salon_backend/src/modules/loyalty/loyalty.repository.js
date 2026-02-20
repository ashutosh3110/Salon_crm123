import BaseRepository from '../base.repository.js';
import LoyaltyRule from './loyaltyRule.model.js';
import LoyaltyWallet from './loyaltyWallet.model.js';
import LoyaltyTransaction from './loyaltyTransaction.model.js';
import Referral from './referral.model.js';

class LoyaltyRepository extends BaseRepository {
    constructor() {
        super(LoyaltyTransaction);
        this.RuleModel = LoyaltyRule;
        this.WalletModel = LoyaltyWallet;
        this.ReferralModel = Referral;
    }

    async getRule(tenantId) {
        return this.RuleModel.findOne({ tenantId, isActive: true });
    }

    async getWallet(tenantId, customerId) {
        return this.WalletModel.findOne({ tenantId, customerId });
    }

    async updateWallet(tenantId, customerId, points) {
        return this.WalletModel.findOneAndUpdate(
            { tenantId, customerId },
            { $inc: { totalPoints: points } },
            { upsert: true, new: true }
        );
    }

    async createTransaction(data) {
        return this.model.create(data);
    }

    async getTransactionsByInvoice(tenantId, invoiceId) {
        return this.model.find({ tenantId, invoiceId });
    }
}

export default new LoyaltyRepository();
