import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { hrPerformanceValidation } from '../../validations/hrPerformance.validation.js';
import hrPerformanceController from './hrPerformance.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

const adminRoles = ['admin', 'manager', 'superadmin', 'accountant'];

router.get('/', authorize(adminRoles), validate(hrPerformanceValidation.listQuery), hrPerformanceController.list);

router.patch(
    '/staff/:userId/goal',
    authorize(adminRoles),
    validate(hrPerformanceValidation.patchGoal),
    hrPerformanceController.patchGoal
);

export default router;
