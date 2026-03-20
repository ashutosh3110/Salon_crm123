import httpStatus from 'http-status-codes';
import inquiryService from './inquiry.service.js';

const createInquiry = async (req, res, next) => {
    try {
        const inquiry = await inquiryService.createInquiry(req.tenantId, req.body);
        res.status(httpStatus.CREATED).send(inquiry);
    } catch (error) {
        next(error);
    }
};

const getInquiries = async (req, res, next) => {
    try {
        const filter = {
            search: req.query.search,
            source: req.query.source && req.query.source !== 'All' ? req.query.source : undefined,
            status: req.query.status && req.query.status !== 'All' ? req.query.status : undefined,
        };
        const options = { page: req.query.page, limit: req.query.limit };
        const result = await inquiryService.queryInquiries(req.tenantId, filter, options);
        res.send(result);
    } catch (error) {
        next(error);
    }
};

const updateInquiry = async (req, res, next) => {
    try {
        const inquiry = await inquiryService.updateInquiryById(req.tenantId, req.params.inquiryId, req.body);
        if (!inquiry) return res.status(httpStatus.NOT_FOUND).send({ message: 'Inquiry not found' });
        res.send(inquiry);
    } catch (error) {
        next(error);
    }
};

const deleteInquiry = async (req, res, next) => {
    try {
        const inquiry = await inquiryService.deleteInquiryById(req.tenantId, req.params.inquiryId);
        if (!inquiry) return res.status(httpStatus.NOT_FOUND).send({ message: 'Inquiry not found' });
        res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

const processDueReminders = async (req, res, next) => {
    try {
        const result = await inquiryService.processDueFollowUps(req.tenantId);
        res.send(result);
    } catch (error) {
        next(error);
    }
};

export default {
    createInquiry,
    getInquiries,
    updateInquiry,
    deleteInquiry,
    processDueReminders,
};
