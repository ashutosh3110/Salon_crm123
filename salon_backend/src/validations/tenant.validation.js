import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const createTenant = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        slug: Joi.string(),
        ownerName: Joi.string().allow('', null),
        email: Joi.string().email().required(),
        phone: Joi.string().allow('', null),
        city: Joi.string().allow('', null),
        address: Joi.string().allow('', null),
        gstNumber: Joi.string()
            .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
            .messages({
                'string.pattern.base': 'Invalid GST format (Example: 22AAAAA0000A1Z5)',
            })
            .allow('', null),
        owner: Joi.string().custom(objectId),
        status: Joi.string().valid('active', 'inactive', 'trial', 'expired', 'suspended'),
        subscriptionPlan: Joi.string().valid('free', 'basic', 'pro', 'premium', 'enterprise', 'custom'),
        trialDays: Joi.number(),
        outletsCount: Joi.number(),
        staffCount: Joi.number(),
    }),
};

export const getTenants = {
    query: Joi.object().keys({
        name: Joi.string(),
        status: Joi.string(),
        subscriptionPlan: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

export const getTenant = {
    params: Joi.object().keys({
        tenantId: Joi.string().custom(objectId),
    }),
};

export const updateTenant = {
    params: Joi.object().keys({
        tenantId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            slug: Joi.string(),
            ownerName: Joi.string().allow('', null),
            email: Joi.string().email().allow('', null),
            phone: Joi.string().allow('', null),
            city: Joi.string().allow('', null),
            address: Joi.string().allow('', null),
            latitude: Joi.number().allow(null),
            longitude: Joi.number().allow(null),
            gstNumber: Joi.string().allow('', null),
            owner: Joi.string().custom(objectId),
            status: Joi.string().valid('active', 'inactive', 'trial', 'expired', 'suspended'),
            subscriptionPlan: Joi.string().valid('free', 'basic', 'pro', 'premium', 'enterprise', 'custom'),
            features: Joi.object(),
            limits: Joi.object(),
            trialDays: Joi.number(),
            outletsCount: Joi.number(),
            staffCount: Joi.number(),
        })
        .min(1),
};

export const deleteTenant = {
    params: Joi.object().keys({
        tenantId: Joi.string().custom(objectId),
    }),
};
