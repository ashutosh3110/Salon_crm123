import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const createPromotion = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        type: Joi.string().required().valid('FLAT', 'PERCENTAGE', 'COMBO'),
        value: Joi.number().required().min(0),
        minBillAmount: Joi.number().min(0).default(0),
        applicableServices: Joi.array().items(Joi.string().custom(objectId)),
        applicableProducts: Joi.array().items(Joi.string().custom(objectId)),
        startDate: Joi.date().required(),
        endDate: Joi.date().required().greater(Joi.ref('startDate')),
        isActive: Joi.boolean(),
        usageLimit: Joi.number().integer().min(1),
    }),
};
