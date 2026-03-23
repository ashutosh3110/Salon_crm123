import express from 'express';
import geocodeController from './geocode.controller.js';

const router = express.Router();

// Public endpoint (no auth): /v1/geocode?q=Indore
router.get('/', geocodeController.geocodeQuery);

export default router;

