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
