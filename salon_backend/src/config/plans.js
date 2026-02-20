/**
 * Centralized Plan Definitions
 * In a production app, these eventually move to a Database collection (Plans)
 * accessible by Super Admin, but kept here for core logic.
 */
export const PLANS = {
    FREE: {
        name: 'Free',
        limits: {
            staff: 2,
            products: 10,
            services: 5,
            outlets: 1,
            analytics: false,
        },
    },
    BASIC: {
        name: 'Basic',
        limits: {
            staff: 10,
            products: 100,
            services: 50,
            outlets: 2,
            analytics: true,
        },
    },
    PREMIUM: {
        name: 'Premium',
        limits: {
            staff: 50,
            products: 1000,
            services: 500,
            outlets: 10,
            analytics: true,
        },
    },
    ENTERPRISE: {
        name: 'Enterprise',
        limits: {
            staff: Infinity,
            products: Infinity,
            services: Infinity,
            outlets: Infinity,
            analytics: true,
        },
    },
};

export const getPlanLimits = (planName) => {
    return PLANS[planName?.toUpperCase()] || PLANS.FREE;
};
