import Joi from 'joi';

const ymd = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required();

export const commissionsQuery = {
    query: Joi.object()
        .keys({
            period: Joi.string()
                .valid('CURRENT_CYCLE', 'PREVIOUS_CYCLE', 'FISCAL_YTD', 'CUSTOM_RANGE')
                .optional(),
            startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
            endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
        })
        .unknown(false),
};

export const overviewQuery = {
    query: Joi.object()
        .keys({
            date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
        })
        .unknown(false),
};

export const timeOffCreate = {
    body: Joi.object()
        .keys({
            type: Joi.string()
                .valid('CASUAL_LEAVE', 'MEDICAL_LEAVE', 'PAID_LEAVE', 'SICK_BUFFER')
                .required(),
            startDate: ymd,
            endDate: ymd,
            reason: Joi.string().trim().max(2000).allow('').optional(),
        })
        .unknown(false),
};
