import express from 'express';
import clientController from './client.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import validate from '../../middlewares/validate.js';
import authorize from '../../middlewares/role.js';
import { clientValidation } from '../../validations/index.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router.get(
    '/stylist-roster',
    authorize(['stylist']),
    validate(clientValidation.stylistRosterQuery),
    clientController.getStylistRoster
);

router.get(
    '/:clientId/stylist-history',
    authorize(['stylist']),
    validate(clientValidation.clientIdParam),
    clientController.getStylistClientHistory
);

router
    .route('/')
    .post(validate(clientValidation.createClient), clientController.createClient)
    .get(validate(clientValidation.getClients), clientController.getClients);

router
    .route('/:clientId')
    .get(clientController.getClient)
    .patch(validate(clientValidation.updateClient), clientController.updateClient);

export default router;
