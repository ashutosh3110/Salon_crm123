import httpStatus from 'http-status-codes';
import loyaltyService from './loyalty.service.js';
import loyaltyRepository from './loyalty.repository.js';

const getWallet = async (req, res, next) => {
    try {
        const wallet = await loyaltyRepository.getWallet(req.tenantId, req.params.customerId);
        res.send(wallet || { totalPoints: 0 });
    } catch (error) {
        next(error);
    }
};

const getHistory = async (req, res, next) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
        };
        const history = await loyaltyRepository.find({
            tenantId: req.tenantId,
            customerId: req.params.customerId
        }, options);
        res.send(history);
    } catch (error) {
        next(error);
    }
};

const setupRules = async (req, res, next) => {
    try {
        // Only Admin can setup rules
        const rule = await loyaltyRepository.RuleModel.findOneAndUpdate(
            { tenantId: req.tenantId },
            { ...req.body, tenantId: req.tenantId },
            { upsert: true, new: true }
        );
        res.send(rule);
    } catch (error) {
        next(error);
    }
};

const referCustomer = async (req, res, next) => {
    try {
        const referral = await loyaltyService.createReferral(
            req.tenantId,
            req.user._id, // Assumes referrer is the logged in user for this example or passed in body
            req.body.referredCustomerId
        );
        res.status(httpStatus.CREATED).send(referral);
    } catch (error) {
        next(error);
    }
};

export default {
    getWallet,
    getHistory,
    setupRules,
    referCustomer,
};
