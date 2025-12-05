/**
 * Cache Manager
 * Provides caching interface following Strategy Pattern
 * Can work with different cache implementations (Redis, Memory, etc.)
 */
class CacheManager {
  /**
   * Create a Cache Manager
   * @param {Object} cacheClient - Cache client (Redis, Memory, etc.)
   * @param {Object} logger - Logger instance
   */
  constructor(cacheClient, logger = console) {
    this.cache = cacheClient;
    this.logger = logger;
    this.enabled = true;
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null
   */
  async get(key) {
    if (!this.enabled) {
      return null;
    }

    try {
      this.logger.debug(`Cache GET: ${key}`);

      const cached = await this.cache.get(key);

      if (cached) {
        this.logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(cached);
      }

      this.logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}`, error);
      return null;
    }
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 3600)
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = 3600) {
    if (!this.enabled) {
      return false;
    }

    try {
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);

      await this.cache.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}`, error);
      return false;
    }
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    if (!this.enabled) {
      return false;
    }

    try {
      this.logger.debug(`Cache DELETE: ${key}`);

      await this.cache.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Cache DELETE error for key ${key}`, error);
      return false;
    }
  }

  /**
   * Invalidate cache by pattern
   * @param {string} pattern - Key pattern (e.g., 'employee:*')
   * @returns {Promise<number>} Number of keys deleted
   */
  async invalidate(pattern) {
    if (!this.enabled) {
      return 0;
    }

    try {
      this.logger.info(`Cache INVALIDATE: ${pattern}`);

      const keys = await this.cache.keys(pattern);

      if (keys.length > 0) {
        await this.cache.del(keys);
        this.logger.info(`Invalidated ${keys.length} cache keys`);
        return keys.length;
      }

      return 0;
    } catch (error) {
      this.logger.error(`Cache INVALIDATE error for pattern ${pattern}`, error);
      return 0;
    }
  }

  /**
   * Check if a key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Existence status
   */
  async exists(key) {
    if (!this.enabled) {
      return false;
    }

    try {
      const result = await this.cache.exists(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Cache EXISTS error for key ${key}`, error);
      return false;
    }
  }

  /**
   * Get or set pattern - get from cache or fetch and cache
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch data if not cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} Cached or fetched value
   */
  async getOrSet(key, fetchFn, ttl = 3600) {
    // Try to get from cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch data
    this.logger.debug(`Cache MISS, fetching: ${key}`);
    const data = await fetchFn();

    // Cache the result
    if (data !== null && data !== undefined) {
      await this.set(key, data, ttl);
    }

    return data;
  }

  /**
   * Clear all cache
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    try {
      this.logger.warn('Clearing all cache');
      await this.cache.flushAll();
      return true;
    } catch (error) {
      this.logger.error('Cache CLEAR error', error);
      return false;
    }
  }

  /**
   * Enable caching
   */
  enable() {
    this.logger.info('Cache enabled');
    this.enabled = true;
  }

  /**
   * Disable caching
   */
  disable() {
    this.logger.info('Cache disabled');
    this.enabled = false;
  }

  /**
   * Check if cache is enabled
   * @returns {boolean} Enabled status
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getStats() {
    try {
      const info = await this.cache.info();
      return {
        enabled: this.enabled,
        info
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats', error);
      return {
        enabled: this.enabled,
        error: error.message
      };
    }
  }
}

module.exports = CacheManager;
