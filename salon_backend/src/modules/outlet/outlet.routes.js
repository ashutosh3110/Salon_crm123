import express from 'express';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import outletController from './outlet.controller.js';

const router = express.Router();

router.get('/nearby', outletController.getNearbyOutletsPublic);
router.get('/reverse-geocode', outletController.reverseGeocode);
router.get('/geocode', outletController.geocodeQuery);

router.use(auth);
router.use(validateTenant);

router
    .route('/')
    .post(authorize(['admin', 'manager']), outletController.createOutlet)
    .get(authorize(['admin', 'manager', 'receptionist', 'customer']), outletController.getOutlets);

router
    .route('/:outletId')
    .get(authorize(['admin', 'manager', 'receptionist', 'customer']), outletController.getOutlet)
    .patch(authorize(['admin', 'manager']), outletController.updateOutlet)
    .delete(authorize(['admin', 'manager']), outletController.deleteOutlet);

router.patch('/:outletId/bank', authorize(['admin', 'manager', 'accountant']), outletController.updateBankDetails);

export default router;
