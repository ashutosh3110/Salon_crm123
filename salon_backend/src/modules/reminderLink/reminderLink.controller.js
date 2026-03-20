import httpStatus from 'http-status-codes';
import reminderLinkService from './reminderLink.service.js';

const getState = async (req, res, next) => {
    try {
        const data = await reminderLinkService.getState(req.tenantId);
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const addBridalBooking = async (req, res, next) => {
    try {
        const data = await reminderLinkService.addBridalBooking(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(data);
    } catch (error) {
        next(error);
    }
};

const updateBridalBooking = async (req, res, next) => {
    try {
        const data = await reminderLinkService.updateBridalBooking(req.tenantId, req.params.bookingId, req.body);
        if (!data) return res.status(httpStatus.NOT_FOUND).send({ message: 'Bridal booking not found' });
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const deleteBridalBooking = async (req, res, next) => {
    try {
        const ok = await reminderLinkService.deleteBridalBooking(req.tenantId, req.params.bookingId);
        if (!ok) return res.status(httpStatus.NOT_FOUND).send({ message: 'Bridal booking not found' });
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

const toggleBridalReminder = async (req, res, next) => {
    try {
        const data = await reminderLinkService.toggleBridalReminder(req.tenantId, req.params.bookingId, req.params.reminderId);
        if (!data) return res.status(httpStatus.NOT_FOUND).send({ message: 'Reminder not found' });
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const addRule = async (req, res, next) => {
    try {
        const data = await reminderLinkService.addRule(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(data);
    } catch (error) {
        next(error);
    }
};

const updateRule = async (req, res, next) => {
    try {
        const data = await reminderLinkService.updateRule(req.tenantId, req.params.ruleId, req.body);
        if (!data) return res.status(httpStatus.NOT_FOUND).send({ message: 'Rule not found' });
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const deleteRule = async (req, res, next) => {
    try {
        const ok = await reminderLinkService.deleteRule(req.tenantId, req.params.ruleId);
        if (!ok) return res.status(httpStatus.NOT_FOUND).send({ message: 'Rule not found' });
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

const updateSettings = async (req, res, next) => {
    try {
        const data = await reminderLinkService.updateSettings(req.tenantId, req.body);
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const processDueEventReminders = async (req, res, next) => {
    try {
        const data = await reminderLinkService.processDueEventReminders(req.tenantId);
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const broadcastBookingLinkWhatsApp = async (req, res, next) => {
    try {
        const data = await reminderLinkService.broadcastBookingLinkWhatsApp(req.tenantId, req.body?.message);
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const getPendingServiceSignals = async (req, res, next) => {
    try {
        const data = await reminderLinkService.getPendingServiceSignals(req.tenantId);
        res.send({ results: data });
    } catch (error) {
        next(error);
    }
};

const markServiceSignalReplied = async (req, res, next) => {
    try {
        const data = await reminderLinkService.markServiceSignalReplied(req.tenantId, req.body.clientId, req.body.ruleId);
        res.send(data);
    } catch (error) {
        next(error);
    }
};

const sendServiceReminderWhatsApp = async (req, res, next) => {
    try {
        const data = await reminderLinkService.sendServiceReminderWhatsApp(req.tenantId, req.body.clientId, req.body.ruleId);
        if (!data) return res.status(httpStatus.NOT_FOUND).send({ message: 'Client/rule not found' });
        res.send(data);
    } catch (error) {
        next(error);
    }
};

export default {
    getState,
    addBridalBooking,
    updateBridalBooking,
    deleteBridalBooking,
    toggleBridalReminder,
    addRule,
    updateRule,
    deleteRule,
    updateSettings,
    processDueEventReminders,
    broadcastBookingLinkWhatsApp,
    getPendingServiceSignals,
    markServiceSignalReplied,
    sendServiceReminderWhatsApp,
};
