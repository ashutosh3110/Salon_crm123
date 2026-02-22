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
            retryStrategy: (times) => {
                // Try to reconnect for a while, but eventually give up if it's just not there
                if (times > 10) {
                    logger.warn('Redis reconnection failed after 10 attempts. Caching/Rate limiting might be affected.');
                    return null;
                }
                return Math.min(times * 100, 3000);
            },
            reconnectOnError: (err) => {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    return true;
                }
                return false;
            }
        });

        redis.on('connect', () => {
            logger.info('Connected to Redis');
        });

        redis.on('error', (err) => {
            // Only log Redis errors as warnings to avoid crashing the process during development
            logger.warn('Redis connection issue:', err.message);
        });
    } catch (err) {
        logger.warn('Failed to initialize Redis (Optional):', err.message);
    }
} else {
    logger.info('Redis URL not provided, caching will be disabled.');
}

export default redis;
