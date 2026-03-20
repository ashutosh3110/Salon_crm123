import Joi from 'joi';

const reminderSchema = Joi.object({
    id: Joi.string().required(),
    label: Joi.string().required(),
    daysBefore: Joi.number().required(),
    active: Joi.boolean(),
    sentAt: Joi.date().allow(null),
});

export const addBridalBooking = {
    body: Joi.object().keys({
        clientName: Joi.string().required(),
        clientPhone: Joi.string().required(),
        eventName: Joi.string().required(),
        eventDate: Joi.date().required(),
        service: Joi.string().allow(''),
        reminders: Joi.array().items(reminderSchema),
    }),
};

export const updateBridalBooking = {
    body: Joi.object()
        .keys({
            clientName: Joi.string(),
            clientPhone: Joi.string(),
            eventName: Joi.string(),
            eventDate: Joi.date(),
            service: Joi.string().allow(''),
            reminders: Joi.array().items(reminderSchema),
        })
        .min(1),
};

export const addRule = {
    body: Joi.object().keys({
        category: Joi.string().required(),
        interval: Joi.number().required(),
        channel: Joi.string().valid('WhatsApp', 'Email', 'SMS'),
        message: Joi.string().required(),
        active: Joi.boolean(),
    }),
};

export const updateRule = {
    body: Joi.object()
        .keys({
            category: Joi.string(),
            interval: Joi.number(),
            channel: Joi.string().valid('WhatsApp', 'Email', 'SMS'),
            message: Joi.string(),
            active: Joi.boolean(),
        })
        .min(1),
};

export const updateSettings = {
    body: Joi.object()
        .keys({
            salonSlug: Joi.string(),
            welcomeMsg: Joi.string(),
            showServices: Joi.boolean(),
        })
        .min(1),
};

export const socialShareWhatsApp = {
    body: Joi.object().keys({
        message: Joi.string().allow(''),
    }),
};

export const markServiceSignalReplied = {
    body: Joi.object().keys({
        clientId: Joi.string().required(),
        ruleId: Joi.string().required(),
    }),
};

export const sendServiceSignalWhatsApp = {
    body: Joi.object().keys({
        clientId: Joi.string().required(),
        ruleId: Joi.string().required(),
    }),
};
