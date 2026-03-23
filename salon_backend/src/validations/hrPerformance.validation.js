import Joi from 'joi';

const dateYmd = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required();
const objectId = Joi.string().hex().length(24).required();

export const hrPerformanceValidation = {
    listQuery: {
        query: Joi.object().keys({
            startDate: dateYmd,
            endDate: dateYmd,
        }),
    },
    patchGoal: {
        params: Joi.object().keys({
            userId: objectId,
        }),
        body: Joi.object().keys({
            goal: Joi.number().min(0).required(),
        }),
    },
};
