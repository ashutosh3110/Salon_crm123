import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { feedbackValidation } from '../../validations/feedback.validation.js';
import feedbackController from './feedback.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router.get(
    '/',
    authorize(['admin', 'manager', 'superadmin', 'customer']),
    feedbackController.getFeedbacks
);

router.post(
    '/',
    authorize(['customer', 'admin', 'manager', 'superadmin']),
    validate(feedbackValidation.create),
    feedbackController.createFeedback
);

router.patch(
    '/:feedbackId',
    authorize(['admin', 'manager', 'superadmin']),
    validate(feedbackValidation.update),
    feedbackController.patchFeedback
);

router.patch(
    '/:feedbackId/archive',
    authorize(['admin', 'manager', 'superadmin']),
    feedbackController.archive
);

export default router;

