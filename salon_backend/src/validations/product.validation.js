import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const createProduct = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        sku: Joi.string().required(),
        price: Joi.number().required().min(0),
        category: Joi.string(),
    }),
};

export const getProducts = {
    query: Joi.object().keys({
        name: Joi.string(),
        page: Joi.number().integer(),
        limit: Joi.number().integer(),
    }),
};
