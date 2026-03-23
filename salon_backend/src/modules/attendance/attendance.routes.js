import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { attendanceValidation } from '../../validations/attendance.validation.js';
import attendanceController from './attendance.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

const adminRoles = ['admin', 'manager', 'superadmin'];
const punchRoles = ['admin', 'manager', 'receptionist', 'stylist', 'accountant', 'inventory_manager'];

router.get(
    '/worksite',
    authorize(punchRoles),
    attendanceController.getWorksite
);

router.get(
    '/me',
    authorize(punchRoles),
    validate(attendanceValidation.meQuery),
    attendanceController.getMine
);

router.get(
    '/',
    authorize(adminRoles),
    validate(attendanceValidation.listQuery),
    attendanceController.listByDate
);

router.post(
    '/',
    authorize(adminRoles),
    validate(attendanceValidation.upsert),
    attendanceController.upsert
);

router.post(
    '/bulk',
    authorize(adminRoles),
    validate(attendanceValidation.bulk),
    attendanceController.bulk
);

router.post(
    '/punch',
    authorize(punchRoles),
    validate(attendanceValidation.punch),
    attendanceController.punch
);

export default router;
