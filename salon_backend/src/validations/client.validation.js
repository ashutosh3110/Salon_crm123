import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const createClient = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email(),
        phone: Joi.string().required(),
        gender: Joi.string().valid('male', 'female', 'other'),
        birthday: Joi.date(),
        notes: Joi.string().allow(''),
    }),
};

export const getClients = {
    query: Joi.object().keys({
        name: Joi.string(),
        page: Joi.number().integer(),
        limit: Joi.number().integer(),
    }),
};
