import Joi from 'joi';

const expenseCategory = Joi.string().valid(
    'sales',
    'service',
    'commission',
    'salary',
    'rent',
    'inventory',
    'utilities',
    'maintenance',
    'marketing',
    'supplies',
    'welfare',
    'other'
);

const paymentMethod = Joi.string().valid('cash', 'card', 'online', 'unpaid');

const denominationsBody = Joi.object().pattern(
    Joi.string(),
    Joi.alternatives().try(Joi.number(), Joi.string().allow(''))
);

export const financeValidation = {
    listExpenses: {
        query: Joi.object().unknown(true),
    },
    createExpense: {
        body: Joi.object()
            .keys({
                amount: Joi.number().positive().required(),
                category: expenseCategory.required(),
                paymentMethod: paymentMethod.required(),
                description: Joi.string().allow('').optional(),
                date: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
                outletId: Joi.string().trim().allow('', null).optional(),
            })
            .required(),
    },
    pettyCashOpenDay: {
        body: Joi.object()
            .keys({
                staffName: Joi.string().trim().allow('', null).optional(),
                staff: Joi.string().trim().allow('', null).optional(),
            })
            .unknown(true),
    },
    pettyCashFund: {
        body: Joi.object()
            .keys({
                amount: Joi.number().positive().required(),
                source: Joi.string().trim().allow('', null).optional(),
                givenBy: Joi.string().trim().allow('', null).optional(),
                description: Joi.string().trim().allow('', null).optional(),
            })
            .required(),
    },
    pettyCashExpense: {
        body: Joi.object()
            .keys({
                amount: Joi.number().positive().required(),
                category: Joi.string().trim().required(),
                description: Joi.string().trim().required(),
                staff: Joi.string().trim().allow('', null).optional(),
                attachment: Joi.string().trim().allow('', null).optional(),
            })
            .required(),
    },
    pettyCashClose: {
        body: Joi.object()
            .keys({
                denominations: denominationsBody.required(),
                verifiedBy: Joi.string().trim().allow('', null).optional(),
                verifiedByName: Joi.string().trim().allow('', null).optional(),
            })
            .required(),
    },
    pettyCashList: {
        query: Joi.object().unknown(true),
    },
    cashBankSummary: {
        query: Joi.object({
            date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
        })
            .unknown(true),
    },
    cashBankSave: {
        body: Joi.object({
            businessDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
            actualCash: Joi.number().required(),
            actualBank: Joi.number().required(),
            notes: Joi.string().allow('').optional(),
            locked: Joi.boolean().optional(),
        }).required(),
    },
    gstTaxSummary: {
        query: Joi.object({
            from: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
            to: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
            fy: Joi.string().trim().optional(),
        }).unknown(true),
    },
    eodSummary: {
        query: Joi.object({
            date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
        }).unknown(true),
    },
    eodClose: {
        body: Joi.object({
            businessDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
            notes: Joi.string().allow('').optional(),
        }).unknown(true),
    },
    eodHistory: {
        query: Joi.object({
            limit: Joi.number().integer().min(1).max(60).optional(),
        }).unknown(true),
    },
};
