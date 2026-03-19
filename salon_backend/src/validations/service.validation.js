import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const createService = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string(),
        price: Joi.number().required().min(0),
        duration: Joi.number().required().min(1),
        category: Joi.string().required(),
        image: Joi.string().allow(''),
        gst: Joi.number().min(0).max(100),
        commissionApplicable: Joi.boolean(),
        commissionType: Joi.string().valid('percent', 'fixed'),
        commissionValue: Joi.number().min(0),
        outletIds: Joi.array().items(Joi.string().custom(objectId)),
        status: Joi.string().valid('active', 'inactive'),
    }),
};

export const getServices = {
    query: Joi.object().keys({
        name: Joi.string(),
        page: Joi.number().integer(),
        limit: Joi.number().integer(),
    }),
};

export const getService = {
    params: Joi.object().keys({
        serviceId: Joi.string().custom(objectId),
    }),
};

export const updateService = {
    params: Joi.object().keys({
        serviceId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            description: Joi.string(),
            price: Joi.number().min(0),
            duration: Joi.number().min(1),
            category: Joi.string(),
            image: Joi.string().allow(''),
            gst: Joi.number().min(0).max(100),
            commissionApplicable: Joi.boolean(),
            commissionType: Joi.string().valid('percent', 'fixed'),
            commissionValue: Joi.number().min(0),
            outletIds: Joi.array().items(Joi.string().custom(objectId)),
            status: Joi.string().valid('active', 'inactive'),
        })
        .min(1),
};

export const deleteService = {
    params: Joi.object().keys({
        serviceId: Joi.string().custom(objectId),
    }),
};

// Category Validations
export const createCategory = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        gender: Joi.string().valid('men', 'women', 'both'),
        status: Joi.string().valid('active', 'inactive'),
    }),
};

export const updateCategory = {
    params: Joi.object().keys({
        categoryId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            gender: Joi.string().valid('men', 'women', 'both'),
            status: Joi.string().valid('active', 'inactive'),
        })
        .min(1),
};

export const deleteCategory = {
    params: Joi.object().keys({
        categoryId: Joi.string().custom(objectId),
    }),
};
