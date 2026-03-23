import Joi from 'joi';

export const feedbackValidation = {
    create: {
        body: Joi.object().keys({
            customerName: Joi.string().trim().optional().allow(''),
            rating: Joi.number().integer().min(1).max(5).required(),
            comment: Joi.string().trim().required(),
            service: Joi.string().trim().optional().allow(''),
            staffName: Joi.string().trim().optional().allow(''),
            images: Joi.array().items(Joi.string().trim()).optional(),
        }),
    },
    update: {
        body: Joi.object().keys({
            response: Joi.string().trim().optional().allow(''),
            status: Joi.string().valid('Pending', 'Urgent', 'Resolved', 'Archived').optional(),
        }),
    },
};

