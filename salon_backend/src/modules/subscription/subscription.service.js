import subscriptionRepository from './subscription.repository.js';

const createSubscription = async (subscriptionBody) => {
    return subscriptionRepository.create(subscriptionBody);
};

const querySubscriptions = async (filter, options) => {
    return subscriptionRepository.find(filter, options);
};

const getSubscriptionById = async (id) => {
    return subscriptionRepository.findOne({ _id: id });
};

const updateSubscriptionById = async (subscriptionId, updateBody) => {
    const { _id, id, createdAt, updatedAt, ...cleanUpdate } = updateBody;
    const subscription = await subscriptionRepository.updateOne({ _id: subscriptionId }, cleanUpdate);
    if (!subscription) {
        throw new Error('Subscription not found');
    }
    return subscription;
};

const deleteSubscriptionById = async (subscriptionId) => {
    const subscription = await getSubscriptionById(subscriptionId);
    if (!subscription) {
        throw new Error('Subscription not found');
    }
    await subscriptionRepository.deleteOne({ _id: subscriptionId });
    return subscription;
};

const getSubscriptionStats = async () => {
    const response = await subscriptionRepository.find({}, { limit: 1000 });
    const subscriptions = response.results;
    
    const totalPlans = subscriptions.length;
    const activePlans = subscriptions.filter(s => s.active).length;
    const totalSalons = subscriptions.reduce((acc, s) => acc + (s.salonsCount || 0), 0);
    const estimatedMRR = subscriptions.reduce((acc, s) => acc + ((s.salonsCount || 0) * s.monthlyPrice), 0);

    return {
        totalPlans,
        activePlans,
        totalSalons,
        estimatedMRR
    };
};

export default {
    createSubscription,
    querySubscriptions,
    getSubscriptionById,
    updateSubscriptionById,
    deleteSubscriptionById,
    getSubscriptionStats
};
