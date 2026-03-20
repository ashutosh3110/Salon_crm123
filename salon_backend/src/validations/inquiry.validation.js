import Joi from 'joi';
import { objectId } from './custom.validation.js';

export const createInquiry = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().email().allow(''),
        source: Joi.string().valid('Walk-in', 'Phone Call', 'Instagram', 'Facebook', 'WhatsApp', 'Website', 'Referral', 'Other'),
        serviceInterest: Joi.string().allow(''),
        notes: Joi.string().allow(''),
        status: Joi.string().valid('new', 'follow-up', 'converted', 'lost'),
        followUpDate: Joi.date().allow(null),
        reminderChannel: Joi.string().valid('whatsapp', 'none'),
    }),
};

export const getInquiries = {
    query: Joi.object().keys({
        search: Joi.string(),
        source: Joi.string(),
        status: Joi.string(),
        page: Joi.number().integer(),
        limit: Joi.number().integer(),
    }),
};

export const updateInquiry = {
    params: Joi.object().keys({
        inquiryId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            phone: Joi.string(),
            email: Joi.string().email().allow(''),
            source: Joi.string().valid('Walk-in', 'Phone Call', 'Instagram', 'Facebook', 'WhatsApp', 'Website', 'Referral', 'Other'),
            serviceInterest: Joi.string().allow(''),
            notes: Joi.string().allow(''),
            status: Joi.string().valid('new', 'follow-up', 'converted', 'lost'),
            followUpDate: Joi.date().allow(null),
            reminderChannel: Joi.string().valid('whatsapp', 'none'),
            reminderSentAt: Joi.date().allow(null),
        })
        .min(1),
};
