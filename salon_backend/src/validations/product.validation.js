import Joi from 'joi';
import { objectId } from './custom.validation.js';

const extendedSchema = Joi.object().unknown(true).optional().allow(null);

export const createProduct = {
    body: Joi.object()
        .keys({
            name: Joi.string().trim().required(),
            sku: Joi.string().trim().required(),
            price: Joi.number().required().min(0),
            category: Joi.string().allow('', null).optional(),
            status: Joi.string().valid('active', 'inactive'),
            extended: extendedSchema,
        })
        // Older clients / alternate UIs may send extra keys; strip via controller, do not 400 here
        .unknown(true),
};

export const getProducts = {
    query: Joi.object()
        .keys({
            name: Joi.string(),
            page: Joi.number().integer(),
            limit: Joi.number().integer(),
        })
        .unknown(true),
};

export const getProduct = {
    params: Joi.object().keys({
        productId: Joi.string().custom(objectId).required(),
    }),
};

export const updateProduct = {
    params: Joi.object().keys({
        productId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().trim(),
            sku: Joi.string().trim(),
            price: Joi.number().min(0),
            category: Joi.string().allow('', null).optional(),
            status: Joi.string().valid('active', 'inactive'),
            extended: extendedSchema,
        })
        .min(1)
        .unknown(true),
};

export const deleteProduct = {
    params: Joi.object().keys({
        productId: Joi.string().custom(objectId).required(),
    }),
};
