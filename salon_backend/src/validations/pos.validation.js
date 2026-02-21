import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const checkout = {
    body: Joi.object().keys({
        clientId: Joi.string().required().custom(objectId),
        outletId: Joi.string().required().custom(objectId),
        paymentMethod: Joi.string().required().valid('cash', 'card', 'online', 'unpaid'),
        items: Joi.array().items(
            Joi.object().keys({
                type: Joi.string().required().valid('service', 'product'),
                itemId: Joi.string().required().custom(objectId),
                quantity: Joi.number().required().min(1),
                price: Joi.number().required().min(0),
                name: Joi.string(),
                stylistId: Joi.string().custom(objectId),
            })
        ).min(1).required(),
        discount: Joi.number().min(0).default(0),
        tax: Joi.number().min(0).default(0),
        useLoyaltyPoints: Joi.number().integer().min(0).default(0),
        promotionId: Joi.string().custom(objectId),
    }),
};
