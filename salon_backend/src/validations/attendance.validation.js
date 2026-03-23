import Joi from 'joi';

const dateYmd = Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required();

const objectId = Joi.string().hex().length(24).required();

const timeHm = Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .allow('', null);

export const attendanceValidation = {
    listQuery: {
        query: Joi.object().keys({
            date: dateYmd,
        }),
    },
    meQuery: {
        query: Joi.object().keys({
            date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
        }),
    },
    upsert: {
        body: Joi.object().keys({
            userId: objectId,
            date: dateYmd,
            status: Joi.string()
                .valid('present', 'late', 'absent', 'half-day', 'leave')
                .required(),
            checkIn: timeHm.optional(),
            checkOut: timeHm.optional(),
            remark: Joi.string().trim().max(2000).allow('').optional(),
            location: Joi.string().trim().max(200).allow('').optional(),
        }),
    },
    bulk: {
        body: Joi.object().keys({
            date: dateYmd,
            status: Joi.string()
                .valid('present', 'late', 'absent', 'half-day', 'leave')
                .required(),
            userIds: Joi.array().items(Joi.string().hex().length(24)).optional(),
            defaultCheckIn: timeHm.optional(),
            defaultCheckOut: timeHm.optional(),
        }),
    },
    punch: {
        body: Joi.object()
            .keys({
                type: Joi.string().valid('in', 'out').required(),
                date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
                location: Joi.string().trim().max(200).allow('').optional(),
                latitude: Joi.number().min(-90).max(90).optional(),
                longitude: Joi.number().min(-180).max(180).optional(),
            })
            .unknown(false),
    },
};
