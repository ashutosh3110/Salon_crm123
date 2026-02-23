import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs for auth routes
    skipSuccessfulRequests: true,
    skip: (req, res) => config.env !== 'production', // Skip rate limiting in non-production environments
    message: {
        code: 429,
        message: 'Too many login attempts from this IP, please try again after 15 minutes',
    },
});

export const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per minute
    message: {
        code: 429,
        message: 'Too many requests, please slow down',
    },
});
