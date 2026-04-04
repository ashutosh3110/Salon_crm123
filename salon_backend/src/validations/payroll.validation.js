import Joi from 'joi';

const objectId = Joi.string().hex().length(24);
const yearMonth = {
    year: Joi.number().integer().min(2000).max(2100).required(),
    month: Joi.number().integer().min(1).max(12).required(),
};

export const payrollValidation = {
    getMonth: {
        query: Joi.object().keys(yearMonth),
    },
    generate: {
        body: Joi.object().keys(yearMonth),
    },
    setLocked: {
        body: Joi.object().keys({
            ...yearMonth,
            locked: Joi.boolean().required(),
        }),
    },
    patchEntry: {
        params: Joi.object().keys({
            entryId: objectId.required(),
        }),
        body: Joi.object()
            .keys({
                baseSalary: Joi.number().min(0).optional(),
                commission: Joi.number().min(0).optional(),
                incentive: Joi.number().min(0).optional(),
                advance: Joi.number().min(0).optional(),
                deductAdvance: Joi.boolean().optional(),
                deductions: Joi.number().min(0).optional(),
                workingDays: Joi.number().integer().min(0).max(31).optional(),
                status: Joi.string().valid('draft', 'approved', 'paid').optional(),
            })
            .min(1),
    },
    markAllPaid: {
        body: Joi.object().keys(yearMonth),
    },
    syncCommissions: {
        body: Joi.object().keys(yearMonth),
    },
    syncAttendance: {
        body: Joi.object().keys(yearMonth),
    },
};
