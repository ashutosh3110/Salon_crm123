import Joi from 'joi';

const objectId = Joi.string().hex().length(24);
const timeHm = Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required();

export const shiftValidation = {
    create: {
        body: Joi.object().keys({
            name: Joi.string().trim().min(1).max(120).required(),
            startTime: timeHm,
            endTime: timeHm,
            outletId: objectId.required(),
            colorHex: Joi.string().trim().max(32).optional(),
            colorClass: Joi.string().trim().max(64).optional(),
            dayOfWeek: Joi.number().min(0).max(6).optional(),
            date: Joi.string().isoDate().optional(),
            status: Joi.string().valid('Active', 'Pending', 'SwapRequested', 'Completed').optional(),
            assignedUserIds: Joi.array().items(objectId).optional(),
        }),
    },
    update: {
        params: Joi.object().keys({
            shiftId: objectId.required(),
        }),
        body: Joi.object()
            .keys({
                name: Joi.string().trim().min(1).max(120).optional(),
                startTime: Joi.string()
                    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                    .optional(),
                endTime: Joi.string()
                    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                    .optional(),
                outletId: objectId.optional(),
                colorHex: Joi.string().trim().max(32).optional(),
                colorClass: Joi.string().trim().max(64).optional(),
                dayOfWeek: Joi.number().min(0).max(6).optional(),
                date: Joi.string().isoDate().optional(),
                status: Joi.string().valid('Active', 'Pending', 'SwapRequested', 'Completed').optional(),
                assignedUserIds: Joi.array().items(objectId).optional(),
            })
            .min(1),
    },
    roster: {
        params: Joi.object().keys({
            shiftId: objectId.required(),
        }),
        body: Joi.object().keys({
            userIds: Joi.array().items(objectId).default([]),
        }),
    },
    shiftId: {
        params: Joi.object().keys({
            shiftId: objectId.required(),
        }),
    },
};
