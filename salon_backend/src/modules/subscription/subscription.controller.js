import subscriptionService from './subscription.service.js';

const createSubscription = async (req, res, next) => {
    try {
        const subscription = await subscriptionService.createSubscription(req.body);
        res.status(201).send({
            success: true,
            data: subscription
        });
    } catch (error) {
        next(error);
    }
};

const getSubscriptions = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.active !== undefined) {
            filter.active = req.query.active === 'true';
        }
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 100, // Show all plans by default
        };
        const result = await subscriptionService.querySubscriptions(filter, options);
        res.send({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getSubscription = async (req, res, next) => {
    try {
        const subscription = await subscriptionService.getSubscriptionById(req.params.id);
        if (!subscription) {
            return res.status(404).send({ success: false, message: 'Subscription not found' });
        }
        res.send({
            success: true,
            data: subscription
        });
    } catch (error) {
        next(error);
    }
};

const updateSubscription = async (req, res, next) => {
    try {
        const subscription = await subscriptionService.updateSubscriptionById(req.params.id, req.body);
        res.send({
            success: true,
            data: subscription
        });
    } catch (error) {
        next(error);
    }
};

const deleteSubscription = async (req, res, next) => {
    try {
        await subscriptionService.deleteSubscriptionById(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const getStats = async (req, res, next) => {
    try {
        const stats = await subscriptionService.getSubscriptionStats();
        res.send({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createSubscription,
    getSubscriptions,
    getSubscription,
    updateSubscription,
    deleteSubscription,
    getStats
};
