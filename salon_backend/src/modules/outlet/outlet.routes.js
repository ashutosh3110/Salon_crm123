import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import outletController from './outlet.controller.js';

const router = express.Router();

router.use(auth);
router.use(validateTenant);

router
    .route('/')
    .post(outletController.createOutlet)
    .get(outletController.getOutlets);

router
    .route('/:outletId')
    .get(outletController.getOutlet)
    .patch(outletController.updateOutlet)
    .delete(outletController.deleteOutlet);

export default router;
