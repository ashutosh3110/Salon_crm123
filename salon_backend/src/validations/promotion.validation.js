import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const createPromotion = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().allow('', null),
        type: Joi.string().required().valid('FLAT', 'PERCENTAGE', 'COMBO'),
        value: Joi.number().required().min(0),
        maxDiscountAmount: Joi.number().min(0).default(0),
        minBillAmount: Joi.number().min(0).default(0),
        applicableServices: Joi.array().items(Joi.string().custom(objectId)),
        applicableProducts: Joi.array().items(Joi.string().custom(objectId)),
        applicableOutlets: Joi.array().items(Joi.string().custom(objectId)),
        startDate: Joi.date().required(),
        endDate: Joi.date().required().greater(Joi.ref('startDate')),
        isActive: Joi.boolean().default(true),
        targetingType: Joi.string().valid('ALL', 'NEW', 'REGULAR', 'INACTIVE').default('ALL'),
        usageLimitPerCustomer: Joi.number().integer().min(1).default(1),
        totalUsageLimit: Joi.number().integer().min(1),
        activationMode: Joi.string().valid('AUTO', 'COUPON').default('AUTO'),
        couponCode: Joi.string().when('activationMode', {
            is: 'COUPON',
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        startTime: Joi.string().regex(/^([0-9]{2}):([0-9]{2})$/).allow('', null),
        endTime: Joi.string().regex(/^([0-9]{2}):([0-9]{2})$/).allow('', null),
    }),
};
