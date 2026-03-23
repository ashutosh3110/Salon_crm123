import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { stylistValidation } from '../../validations/index.js';
import stylistController from './stylist.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router.get(
    '/commissions',
    authorize(['stylist']),
    validate(stylistValidation.commissionsQuery),
    stylistController.getCommissions
);

router.get(
    '/overview',
    authorize(['stylist']),
    validate(stylistValidation.overviewQuery),
    stylistController.getOverview
);

router.get('/time-off', authorize(['stylist']), stylistController.getTimeOff);

router.post(
    '/time-off',
    authorize(['stylist']),
    validate(stylistValidation.timeOffCreate),
    stylistController.createTimeOff
);

export default router;
