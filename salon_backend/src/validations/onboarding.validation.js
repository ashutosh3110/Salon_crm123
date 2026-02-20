import Joi from 'joi';
import { objectId, password } from './custom.validation.js';

export const confirmSalon = {
    body: Joi.object().keys({
        name: Joi.string(),
        phone: Joi.string(),
        settings: Joi.object().keys({
            currency: Joi.string(),
            timezone: Joi.string(),
        }),
    }),
};

export const createOutlet = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        address: Joi.string().required(),
        phone: Joi.string().required(),
        workingHours: Joi.array().items(
            Joi.object().keys({
                day: Joi.string().required().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
                isOpen: Joi.boolean(),
                openTime: Joi.string(),
                closeTime: Joi.string(),
            })
        ),
    }),
};

export const addStaff = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required().custom(password),
        role: Joi.string().required().valid('manager', 'receptionist', 'stylist', 'accountant', 'inventory_manager'),
    }),
};
