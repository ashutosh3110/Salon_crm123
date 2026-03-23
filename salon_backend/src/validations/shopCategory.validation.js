import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const create = {
    body: Joi.object().keys({
        name: Joi.string().required().trim(),
        image: Joi.string().allow('').max(2_500_000),
        sortOrder: Joi.number().integer(),
    }),
};

export const update = {
    params: Joi.object().keys({
        shopCategoryId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().trim(),
            image: Joi.string().allow('').max(2_500_000),
            sortOrder: Joi.number().integer(),
        })
        .min(1),
};

export const remove = {
    params: Joi.object().keys({
        shopCategoryId: Joi.string().custom(objectId).required(),
    }),
};
