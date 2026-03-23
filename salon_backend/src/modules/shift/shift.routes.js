import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { shiftValidation } from '../../validations/shift.validation.js';
import shiftController from './shift.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

const adminRoles = ['admin', 'manager', 'superadmin'];

router.get('/', authorize(adminRoles), shiftController.list);

router.post('/', authorize(adminRoles), validate(shiftValidation.create), shiftController.create);

router.patch(
    '/:shiftId/roster',
    authorize(adminRoles),
    validate(shiftValidation.roster),
    shiftController.updateRoster
);

router.patch(
    '/:shiftId',
    authorize(adminRoles),
    validate(shiftValidation.update),
    shiftController.update
);

router.delete(
    '/:shiftId',
    authorize(adminRoles),
    validate(shiftValidation.shiftId),
    shiftController.remove
);

export default router;
