import Joi from 'joi';

const supplierBody = {
    name: Joi.string().trim().min(1).required(),
    contact: Joi.string().allow('').optional(),
    gstin: Joi.string().allow('').optional(),
    phone: Joi.string().allow('').optional(),
    email: Joi.alternatives()
        .try(Joi.string().trim().email({ tlds: { allow: false } }), Joi.string().allow(''))
        .optional(),
    address: Joi.string().allow('').optional(),
    due: Joi.number().min(0).optional(),
    status: Joi.string().valid('Active', 'Overdue', 'Inactive').optional(),
};

export const supplierValidation = {
    listInvoices: {
        query: Joi.object().unknown(true),
    },
    recordInvoicePayment: {
        body: Joi.object()
            .keys({
                invoiceKey: Joi.string().trim().min(1).required(),
                amount: Joi.number().positive().required(),
                note: Joi.string().allow('').optional(),
            })
            .required(),
    },
    create: {
        body: Joi.object().keys(supplierBody),
    },
    update: {
        body: Joi.object()
            .keys({
                name: Joi.string().trim().min(1).optional(),
                contact: Joi.string().allow('').optional(),
                gstin: Joi.string().allow('').optional(),
                phone: Joi.string().allow('').optional(),
                email: Joi.alternatives()
                    .try(Joi.string().trim().email({ tlds: { allow: false } }), Joi.string().allow(''))
                    .optional(),
                address: Joi.string().allow('').optional(),
                due: Joi.number().min(0).optional(),
                status: Joi.string().valid('Active', 'Overdue', 'Inactive').optional(),
            })
            .min(1),
    },
};
