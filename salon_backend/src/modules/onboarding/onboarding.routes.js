import express from 'express';
import onboardingController from './onboarding.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';
import authorize from '../../middlewares/role.js';
import validate from '../../middlewares/validate.js';
import { onboardingValidation } from '../../validations/index.js';

const router = express.Router();

// All onboarding routes require auth and admin role
router.use(auth);
router.use(validateTenant);
router.use(authorize(['admin', 'owner']));

router.get('/status', onboardingController.getStatus);
router.post('/salon-confirm', validate(onboardingValidation.confirmSalon), onboardingController.confirmSalon);
router.post('/outlet', validate(onboardingValidation.createOutlet), onboardingController.createOutlet);
router.post('/staff', validate(onboardingValidation.addStaff), onboardingController.addStaff);
router.post('/complete', onboardingController.complete);

export default router;
