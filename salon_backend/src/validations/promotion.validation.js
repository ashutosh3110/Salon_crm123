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

export const updatePromotion = {
    body: Joi.object().keys({
        name: Joi.string().optional(),
        description: Joi.string().allow('', null).optional(),
        type: Joi.string().optional().valid('FLAT', 'PERCENTAGE', 'COMBO'),
        value: Joi.number().optional().min(0),
        maxDiscountAmount: Joi.number().min(0).optional(),
        minBillAmount: Joi.number().min(0).optional(),
        applicableServices: Joi.array().items(Joi.string().custom(objectId)).optional(),
        applicableProducts: Joi.array().items(Joi.string().custom(objectId)).optional(),
        applicableOutlets: Joi.array().items(Joi.string().custom(objectId)).optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        isActive: Joi.boolean().optional(),
        targetingType: Joi.string().valid('ALL', 'NEW', 'REGULAR', 'INACTIVE').optional(),
        usageLimitPerCustomer: Joi.number().integer().min(1).optional(),
        totalUsageLimit: Joi.number().integer().min(1).optional(),
        activationMode: Joi.string().valid('AUTO', 'COUPON').optional(),
        couponCode: Joi.string().optional(),
        startTime: Joi.string().regex(/^([0-9]{2}):([0-9]{2})$/).allow('', null).optional(),
        endTime: Joi.string().regex(/^([0-9]{2}):([0-9]{2})$/).allow('', null).optional(),
    }).custom((obj, helpers) => {
        if (obj.activationMode === 'COUPON' && !obj.couponCode) {
            return helpers.error('any.custom', { message: 'couponCode is required for COUPON activationMode' });
        }
        return obj;
    }, 'couponCode validation')
};

export const validateCoupon = {
    body: Joi.object().keys({
        couponCode: Joi.string().trim().required(),
        billAmount: Joi.number().min(0).required(),
        customerId: Joi.string().optional().custom(objectId),
    }),
};
