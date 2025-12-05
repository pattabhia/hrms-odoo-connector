const redis = require('redis');

/**
 * Redis Cache Client
 * Wrapper around redis client for cache operations
 */
class RedisCache {
  /**
   * Create a Redis Cache Client
   * @param {Object} config - Redis configuration
   * @param {Object} logger - Logger instance
   */
  constructor(config, logger = console) {
    this.config = config;
    this.logger = logger;
    this.client = null;
    this.connected = false;
  }

  /**
   * Connect to Redis
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.connected) {
      return;
    }

    try {
      this.logger.info('Connecting to Redis...', {
        host: this.config.host,
        port: this.config.port
      });

      this.client = redis.createClient({
        socket: {
          host: this.config.host,
          port: this.config.port
        },
        password: this.config.password || undefined
      });

      // Error handler
      this.client.on('error', (err) => {
        this.logger.error('Redis client error', err);
      });

      // Connect event
      this.client.on('connect', () => {
        this.logger.info('Redis client connected');
        this.connected = true;
      });

      // Disconnect event
      this.client.on('disconnect', () => {
        this.logger.warn('Redis client disconnected');
        this.connected = false;
      });

      await this.client.connect();

      this.logger.info('Successfully connected to Redis');
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      // Don't throw error - allow app to run without cache
      this.connected = false;
    }
  }

  /**
   * Get a value
   * @param {string} key - Key
   * @returns {Promise<string|null>} Value
   */
  async get(key) {
    if (!this.connected) {
      return null;
    }
    return await this.client.get(key);
  }

  /**
   * Set a value with expiration
   * @param {string} key - Key
   * @param {number} seconds - TTL in seconds
   * @param {string} value - Value
   * @returns {Promise<string>} Result
   */
  async setEx(key, seconds, value) {
    if (!this.connected) {
      return null;
    }
    return await this.client.setEx(key, seconds, value);
  }

  /**
   * Delete a key or keys
   * @param {string|Array} keys - Key(s) to delete
   * @returns {Promise<number>} Number of keys deleted
   */
  async del(keys) {
    if (!this.connected) {
      return 0;
    }
    return await this.client.del(keys);
  }

  /**
   * Get keys matching pattern
   * @param {string} pattern - Pattern
   * @returns {Promise<Array>} Matching keys
   */
  async keys(pattern) {
    if (!this.connected) {
      return [];
    }
    return await this.client.keys(pattern);
  }

  /**
   * Check if key exists
   * @param {string} key - Key
   * @returns {Promise<number>} 1 if exists, 0 if not
   */
  async exists(key) {
    if (!this.connected) {
      return 0;
    }
    return await this.client.exists(key);
  }

  /**
   * Flush all keys
   * @returns {Promise<string>} Result
   */
  async flushAll() {
    if (!this.connected) {
      return 'NOT_CONNECTED';
    }
    return await this.client.flushAll();
  }

  /**
   * Get Redis info
   * @returns {Promise<string>} Redis info
   */
  async info() {
    if (!this.connected) {
      return 'Redis not connected';
    }
    return await this.client.info();
  }

  /**
   * Disconnect from Redis
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.connected && this.client) {
      this.logger.info('Disconnecting from Redis');
      await this.client.quit();
      this.connected = false;
    }
  }

  /**
   * Check if connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected;
  }
}

module.exports = RedisCache;
