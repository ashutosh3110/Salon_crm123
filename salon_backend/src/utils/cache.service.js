import redis from '../config/redis.js';
import logger from './logger.js';

/**
 * Cache utility for read-heavy operations
 */
class CacheService {
    constructor() {
        this.lastWarnAt = {
            get: 0,
            set: 0,
            del: 0,
        };
        this.warnCooldownMs = 60000;
    }

    logCacheWarning(kind, error) {
        const now = Date.now();
        if (now - (this.lastWarnAt[kind] || 0) < this.warnCooldownMs) return;
        this.lastWarnAt[kind] = now;
        logger.warn(`Cache ${kind.toUpperCase()} issue: ${error?.message || 'unknown error'}`);
    }

    /**
     * Get data from cache
     * @param {string} key 
     */
    async get(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            this.logCacheWarning('get', error);
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
            this.logCacheWarning('set', error);
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
            this.logCacheWarning('del', error);
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
