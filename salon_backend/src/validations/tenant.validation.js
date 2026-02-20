import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const createTenant = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        slug: Joi.string().required(),
        owner: Joi.string().required().custom(objectId),
        subscriptionPlan: Joi.string().valid('free', 'basic', 'premium', 'enterprise'),
    }),
};
