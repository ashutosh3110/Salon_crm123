import Redis from 'ioredis';
import { config } from './index.js';
import logger from '../utils/logger.js';

let redis = {
    get: () => null,
    set: () => null,
    del: () => null,
    on: () => null
};

if (config.redis.url) {
    try {
        redis = new Redis(config.redis.url, {
            lazyConnect: true,
            maxRetriesPerRequest: 0,
            retryStrategy: (times) => {
                if (times > 3) {
                    return null; // Stop retrying after 3 attempts
                }
                return Math.min(times * 100, 3000);
            }
        });

        redis.on('connect', () => {
            logger.info('Connected to Redis');
        });

        redis.on('error', (err) => {
            // Log as warning instead of error to keep it optional/silent
            logger.warn('Redis connection issue (Optional):', err.message);
        });
    } catch (err) {
        logger.warn('Failed to initialize Redis (Optional):', err.message);
    }
} else {
    logger.info('Redis URL not provided, caching will be disabled.');
}

export default redis;
