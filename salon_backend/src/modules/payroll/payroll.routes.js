import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { payrollValidation } from '../../validations/payroll.validation.js';
import payrollController from './payroll.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

const adminRoles = ['admin', 'manager', 'superadmin', 'accountant'];

router.get('/', authorize(adminRoles), validate(payrollValidation.getMonth), payrollController.getMonth);

router.post('/generate', authorize(adminRoles), validate(payrollValidation.generate), payrollController.generate);

router.patch('/period', authorize(adminRoles), validate(payrollValidation.setLocked), payrollController.setLocked);

router.patch(
    '/entries/:entryId',
    authorize(adminRoles),
    validate(payrollValidation.patchEntry),
    payrollController.patchEntry
);

router.post('/mark-all-paid', authorize(adminRoles), validate(payrollValidation.markAllPaid), payrollController.markAllPaid);

export default router;
