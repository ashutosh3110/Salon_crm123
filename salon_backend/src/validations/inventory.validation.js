import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const stockIn = {
    body: Joi.object().keys({
        productId: Joi.string().required().custom(objectId),
        outletId: Joi.string().required().custom(objectId),
        quantity: Joi.number().required().min(1),
        purchasePrice: Joi.number().min(0),
        supplierId: Joi.string().custom(objectId),
    }),
};

export const adjustStock = {
    body: Joi.object().keys({
        productId: Joi.string().required().custom(objectId),
        outletId: Joi.string().required().custom(objectId),
        quantity: Joi.number().required().min(1),
        type: Joi.string().required().valid('ADD', 'DEDUCT'),
        reason: Joi.string().required(),
    }),
};
