import redis from '../config/redis.js';
import logger from './logger.js';

/**
 * Cache utility for read-heavy operations
 */
class CacheService {
    /**
     * Get data from cache
     * @param {string} key 
     */
    async get(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error('Cache Get Error:', error);
            return null;
        }
    }

    /**
     * Set data to cache
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttl In seconds
     */
    async set(key, value, ttl = 3600) {
        try {
            await redis.set(key, JSON.stringify(value), 'EX', ttl);
        } catch (error) {
            logger.error('Cache Set Error:', error);
        }
    }

    /**
     * Delete from cache
     * @param {string} key 
     */
    async del(key) {
        try {
            await redis.del(key);
        } catch (error) {
            logger.error('Cache Del Error:', error);
        }
    }

    /**
     * Generate a tenant-specific cache key
     */
    generateKey(tenantId, module, identifier) {
        return `cache:${tenantId}:${module}:${identifier}`;
    }
}

export default new CacheService();
