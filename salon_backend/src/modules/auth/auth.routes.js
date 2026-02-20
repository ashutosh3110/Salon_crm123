import express from 'express';
import authController from './auth.controller.js';
import validate from '../../middlewares/validate.js';
import { authValidation } from '../../validations/index.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';
import checkSubscriptionLimit from '../../middlewares/subscription.js';

const router = express.Router();

router.post('/register', authLimiter, validate(authValidation.register), authController.register);
router.post('/login', authLimiter, validate(authValidation.login), authController.login);
router.post('/request-otp', authLimiter, validate(authValidation.requestOtp), authController.requestOtp);
router.post('/login-otp', authLimiter, validate(authValidation.loginWithOtp), authController.loginWithOtp);

export default router;
