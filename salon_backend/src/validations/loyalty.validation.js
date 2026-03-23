import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const setupRules = {
    body: Joi.object().keys({
        earnRate: Joi.number().min(0).required(),
        redeemRate: Joi.number().min(0).required(),
        minRedeemPoints: Joi.number().integer().min(0),
        maxEarnPerInvoice: Joi.number().integer().min(0),
        expiryDays: Joi.number().integer().min(1),
        isActive: Joi.boolean(),
    }),
};

export const refer = {
    body: Joi.object().keys({
        referredCustomerId: Joi.string().required().custom(objectId),
    }),
};

export const walletCredit = {
    body: Joi.object().keys({
        customerId: Joi.string().optional().custom(objectId),
        amount: Joi.number().min(1).required(),
        description: Joi.string().optional().allow(''),
    }),
};

export const walletDebit = {
    body: Joi.object().keys({
        customerId: Joi.string().required().custom(objectId),
        amount: Joi.number().min(1).required(),
        description: Joi.string().optional().allow(''),
    }),
};

export const updateReferralSettings = {
    body: Joi.object().keys({
        enabled: Joi.boolean().required(),
        referrerReward: Joi.number().min(0).required(),
        referredReward: Joi.number().min(0).required(),
        threshold: Joi.string().valid('FIRST_SERVICE', 'REGISTRATION', 'FIRST_INVOICE_MIN_1000').required(),
        expiryDays: Joi.number().integer().min(1).required(),
    }),
};
