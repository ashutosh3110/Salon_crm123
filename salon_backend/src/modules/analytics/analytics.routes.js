import express from 'express';
// import auth from '../../middlewares/auth.js'; // Assuming auth middleware exists
import analyticsController from './analytics.controller.js';

const router = express.Router();

// Temporarily disabling auth for testing, or add it if context shows where it is
router.get('/stats', analyticsController.getStats);

export default router;
