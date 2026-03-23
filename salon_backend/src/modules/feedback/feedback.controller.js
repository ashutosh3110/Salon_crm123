import httpStatus from 'http-status-codes';
import feedbackService from './feedback.service.js';

const createFeedback = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const customerId = req.user.role === 'customer' ? req.user._id : req.body.customerId;

        const created = await feedbackService.createFeedback({
            tenantId,
            customerId,
            customerName: req.user.role === 'customer' ? (req.user.name || '') : req.body.customerName,
            rating: req.body.rating,
            comment: req.body.comment,
            service: req.body.service,
            staffName: req.body.staffName,
            images: req.body.images,
        });

        res.status(httpStatus.CREATED).send({ success: true, data: created });
    } catch (error) {
        next(error);
    }
};

const getFeedbacks = async (req, res, next) => {
    try {
        const list = await feedbackService.listFeedbacks(req.tenantId, {
            status: req.query.status,
            rating: req.query.rating,
        });

        res.status(httpStatus.OK).send({ success: true, data: list });
    } catch (error) {
        next(error);
    }
};

const patchFeedback = async (req, res, next) => {
    try {
        const { feedbackId } = req.params;
        const { response, status } = req.body || {};

        const updated = await feedbackService.updateFeedback(req.tenantId, feedbackId, { response, status });
        if (!updated) return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'Feedback not found' });

        res.status(httpStatus.OK).send({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

const archive = async (req, res, next) => {
    try {
        const { feedbackId } = req.params;
        const updated = await feedbackService.archiveFeedback(req.tenantId, feedbackId);
        if (!updated) return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'Feedback not found' });

        res.status(httpStatus.OK).send({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

export default { createFeedback, getFeedbacks, patchFeedback, archive };

