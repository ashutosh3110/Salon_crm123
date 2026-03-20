import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { inquiryValidation } from '../../validations/index.js';
import inquiryController from './inquiry.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router
    .route('/')
    .post(authorize(['admin', 'manager', 'receptionist']), validate(inquiryValidation.createInquiry), inquiryController.createInquiry)
    .get(authorize(['admin', 'manager', 'receptionist']), validate(inquiryValidation.getInquiries), inquiryController.getInquiries);

router
    .route('/:inquiryId')
    .patch(authorize(['admin', 'manager', 'receptionist']), validate(inquiryValidation.updateInquiry), inquiryController.updateInquiry)
    .delete(authorize(['admin', 'manager', 'receptionist']), inquiryController.deleteInquiry);

router
    .route('/process-due-reminders')
    .post(authorize(['admin', 'manager']), inquiryController.processDueReminders);

export default router;
