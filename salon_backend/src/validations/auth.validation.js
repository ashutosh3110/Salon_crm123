import Joi from 'joi';
import { password } from './custom.validation.js';

export const register = {
    body: Joi.object().keys({
        salonName: Joi.string().required(),
        fullName: Joi.string().required(),
        email: Joi.string().required().email(),
        phone: Joi.string().required(),
        password: Joi.string().required().custom(password),
        confirmPassword: Joi.any().valid(Joi.ref('password')).required()
            .messages({ 'any.only': 'Passwords do not match' }),
        subscriptionPlan: Joi.string().valid('free', 'basic', 'premium', 'enterprise'),
    }),
};

export const login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

export const requestOtp = {
    body: Joi.object().keys({
        phone: Joi.string().required(),
        tenantId: Joi.string().required(),
    }),
};

export const loginWithOtp = {
    body: Joi.object().keys({
        phone: Joi.string().required(),
        tenantId: Joi.string().required(),
        otp: Joi.string().required().length(6),
    }),
};
