import express from 'express';
import catalogueController from './catalogue.controller.js';
import auth from '../../middlewares/auth.js';
import validateTenant from '../../middlewares/tenant.js';

const router = express.Router();

// Public route - No auth
router.get('/public/:slug', catalogueController.getPublicCatalogue);

// Protected routes
router.use(auth);
router.use(validateTenant);

router
    .route('/')
    .get(catalogueController.getMyCatalogue)
    .post(catalogueController.createOrUpdateCatalogue);

router.put('/publish', catalogueController.togglePublish);

export default router;
