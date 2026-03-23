import Joi from 'joi';

export const segmentValidation = {
    create: {
        body: Joi.object().keys({
            name: Joi.string().trim().min(1).required(),
            rule: Joi.string().allow('').optional(),
            iconName: Joi.string().trim().optional(),
            color: Joi.string().trim().optional(),
        }),
    },
};

