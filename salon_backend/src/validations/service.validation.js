import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const createService = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string(),
        price: Joi.number().required().min(0),
        duration: Joi.number().required().min(1),
        category: Joi.string().required(),
    }),
};

export const getServices = {
    query: Joi.object().keys({
        name: Joi.string(),
        page: Joi.number().integer(),
        limit: Joi.number().integer(),
    }),
};
