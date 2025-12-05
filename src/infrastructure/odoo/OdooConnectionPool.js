const OdooClient = require('./OdooClient');
const { OdooConnectionError } = require('../../core/errors');

/**
 * Odoo Connection Pool
 * Implements Singleton Pattern for connection pooling
 * Manages a pool of Odoo client connections for better performance
 */
class OdooConnectionPool {
  static instance = null;

  /**
   * Get singleton instance of connection pool
   * @param {Object} config - Odoo configuration
   * @param {Object} logger - Logger instance
   * @returns {OdooConnectionPool} Singleton instance
   */
  static getInstance(config = null, logger = console) {
    if (!OdooConnectionPool.instance) {
      if (!config) {
        throw new Error('Config is required for first initialization of OdooConnectionPool');
      }
      OdooConnectionPool.instance = new OdooConnectionPool(config, logger);
    }
    return OdooConnectionPool.instance;
  }

  /**
   * Reset singleton instance (mainly for testing)
   */
  static resetInstance() {
    if (OdooConnectionPool.instance) {
      OdooConnectionPool.instance.destroy();
      OdooConnectionPool.instance = null;
    }
  }

  /**
   * Create a connection pool
   * @private
   * @param {Object} config - Odoo configuration
   * @param {Object} logger - Logger instance
   */
  constructor(config, logger = console) {
    this.config = config;
    this.logger = logger;

    // Pool configuration
    this.minConnections = config.pool.min || 2;
    this.maxConnections = config.pool.max || 10;
    this.idleTimeout = config.pool.idleTimeoutMillis || 30000;

    // Connection tracking
    this.availableConnections = [];
    this.activeConnections = new Set();
    this.connectionQueue = [];

    // Statistics
    this.stats = {
      created: 0,
      acquired: 0,
      released: 0,
      destroyed: 0,
      queuedRequests: 0
    };

    this.logger.info('OdooConnectionPool initialized', {
      min: this.minConnections,
      max: this.maxConnections
    });
  }

  /**
   * Initialize the pool with minimum connections
   */
  async initialize() {
    this.logger.info('Initializing connection pool with minimum connections');

    const promises = [];
    for (let i = 0; i < this.minConnections; i++) {
      promises.push(this._createConnection());
    }

    await Promise.all(promises);

    this.logger.info(`Connection pool initialized with ${this.minConnections} connections`);
  }

  /**
   * Get a connection from the pool
   * @returns {Promise<OdooClient>} Odoo client connection
   */
  async acquire() {
    this.stats.acquired++;

    // Check for available connection
    if (this.availableConnections.length > 0) {
      const connection = this.availableConnections.shift();
      this.activeConnections.add(connection);

      this.logger.debug('Acquired existing connection from pool', {
        available: this.availableConnections.length,
        active: this.activeConnections.size
      });

      return connection;
    }

    // Create new connection if under max limit
    if (this.activeConnections.size < this.maxConnections) {
      const connection = await this._createConnection();
      this.activeConnections.add(connection);

      this.logger.debug('Created and acquired new connection', {
        available: this.availableConnections.length,
        active: this.activeConnections.size
      });

      return connection;
    }

    // Wait for available connection
    this.stats.queuedRequests++;
    this.logger.warn('Connection pool exhausted, queuing request', {
      queueSize: this.connectionQueue.length + 1
    });

    return await this._waitForConnection();
  }

  /**
   * Release a connection back to the pool
   * @param {OdooClient} connection - Connection to release
   */
  release(connection) {
    this.stats.released++;

    if (!this.activeConnections.has(connection)) {
      this.logger.warn('Attempted to release unknown connection');
      return;
    }

    this.activeConnections.delete(connection);

    // Check if there are queued requests
    if (this.connectionQueue.length > 0) {
      const resolve = this.connectionQueue.shift();
      this.activeConnections.add(connection);
      resolve(connection);

      this.logger.debug('Released connection to queued request', {
        queueSize: this.connectionQueue.length
      });
    } else {
      // Add back to available connections
      this.availableConnections.push(connection);

      // Set idle timeout
      this._setIdleTimeout(connection);

      this.logger.debug('Released connection back to pool', {
        available: this.availableConnections.length,
        active: this.activeConnections.size
      });
    }
  }

  /**
   * Execute a function with a pooled connection
   * Automatically acquires and releases the connection
   * @param {Function} fn - Function to execute (receives OdooClient as parameter)
   * @returns {Promise<any>} Result of the function
   */
  async withConnection(fn) {
    const connection = await this.acquire();

    try {
      return await fn(connection);
    } finally {
      this.release(connection);
    }
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool statistics
   */
  getStats() {
    return {
      ...this.stats,
      available: this.availableConnections.length,
      active: this.activeConnections.size,
      total: this.availableConnections.length + this.activeConnections.size,
      queued: this.connectionQueue.length
    };
  }

  /**
   * Destroy all connections and clean up
   */
  async destroy() {
    this.logger.info('Destroying connection pool');

    // Clear queue
    this.connectionQueue.forEach((resolve) => {
      resolve(null);
    });
    this.connectionQueue = [];

    // Disconnect all connections
    const allConnections = [
      ...this.availableConnections,
      ...Array.from(this.activeConnections)
    ];

    await Promise.all(
      allConnections.map(async (connection) => {
        try {
          await connection.disconnect();
          this.stats.destroyed++;
        } catch (error) {
          this.logger.error('Error disconnecting connection', error);
        }
      })
    );

    this.availableConnections = [];
    this.activeConnections.clear();

    this.logger.info('Connection pool destroyed', this.stats);
  }

  /**
   * Create a new connection
   * @private
   * @returns {Promise<OdooClient>} New Odoo client connection
   */
  async _createConnection() {
    try {
      const connection = new OdooClient(this.config, this.logger);
      await connection.connect();

      this.stats.created++;
      this.availableConnections.push(connection);

      this.logger.debug('Created new connection', {
        total: this.stats.created
      });

      return connection;
    } catch (error) {
      this.logger.error('Failed to create connection', error);
      throw new OdooConnectionError('Failed to create connection', error);
    }
  }

  /**
   * Wait for an available connection
   * @private
   * @returns {Promise<OdooClient>} Available connection
   */
  async _waitForConnection() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.connectionQueue.indexOf(resolve);
        if (index > -1) {
          this.connectionQueue.splice(index, 1);
        }
        reject(
          new OdooConnectionError(
            'Timeout waiting for available connection',
            null
          )
        );
      }, this.config.pool.connectionTimeoutMillis || 10000);

      this.connectionQueue.push((connection) => {
        clearTimeout(timeout);
        if (connection) {
          resolve(connection);
        } else {
          reject(new OdooConnectionError('Connection pool is closing'));
        }
      });
    });
  }

  /**
   * Set idle timeout for a connection
   * @private
   * @param {OdooClient} connection - Connection to set timeout for
   */
  _setIdleTimeout(connection) {
    // Only set timeout if we have more than minimum connections
    if (this.availableConnections.length > this.minConnections) {
      setTimeout(() => {
        const index = this.availableConnections.indexOf(connection);
        if (index > -1) {
          this.availableConnections.splice(index, 1);
          connection.disconnect();
          this.stats.destroyed++;

          this.logger.debug('Destroyed idle connection', {
            available: this.availableConnections.length
          });
        }
      }, this.idleTimeout);
    }
  }

  // ============================================================================
  // IOdooClient Interface Implementation
  // These methods allow the pool to be used as a drop-in replacement for OdooClient
  // ============================================================================

  /**
   * Connect - for pool, this initializes minimum connections
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.availableConnections.length === 0 && this.activeConnections.size === 0) {
      await this.initialize();
    }
  }

  /**
   * Execute Odoo RPC method using pooled connection
   * @param {string} model - Odoo model name
   * @param {string} method - Method name
   * @param {Array} params - Method parameters
   * @param {Object} kwargs - Keyword arguments
   * @returns {Promise<any>} Method result
   */
  async execute_kw(model, method, params = [], kwargs = {}) {
    return await this.withConnection(async (connection) => {
      return await connection.execute_kw(model, method, params, kwargs);
    });
  }

  /**
   * Search for records
   * @param {string} model - Odoo model name
   * @param {Array} domain - Search domain
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of record IDs
   */
  async search(model, domain = [], options = {}) {
    return await this.withConnection(async (connection) => {
      return await connection.search(model, domain, options);
    });
  }

  /**
   * Read records
   * @param {string} model - Odoo model name
   * @param {Array} ids - Record IDs
   * @param {Array} fields - Fields to read
   * @returns {Promise<Array>} Array of records
   */
  async read(model, ids, fields = []) {
    return await this.withConnection(async (connection) => {
      return await connection.read(model, ids, fields);
    });
  }

  /**
   * Search and read records
   * @param {string} model - Odoo model name
   * @param {Array} domain - Search domain
   * @param {Array} fields - Fields to read
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of records
   */
  async searchRead(model, domain = [], fields = [], options = {}) {
    return await this.withConnection(async (connection) => {
      return await connection.searchRead(model, domain, fields, options);
    });
  }

  /**
   * Create a record
   * @param {string} model - Odoo model name
   * @param {Object} values - Record values
   * @returns {Promise<number>} Created record ID
   */
  async create(model, values) {
    return await this.withConnection(async (connection) => {
      return await connection.create(model, values);
    });
  }

  /**
   * Update records
   * @param {string} model - Odoo model name
   * @param {Array} ids - Record IDs
   * @param {Object} values - Updated values
   * @returns {Promise<boolean>} Success status
   */
  async write(model, ids, values) {
    return await this.withConnection(async (connection) => {
      return await connection.write(model, ids, values);
    });
  }

  /**
   * Delete records
   * @param {string} model - Odoo model name
   * @param {Array} ids - Record IDs
   * @returns {Promise<boolean>} Success status
   */
  async unlink(model, ids) {
    return await this.withConnection(async (connection) => {
      return await connection.unlink(model, ids);
    });
  }

  /**
   * Check if pool is connected (has available or active connections)
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.availableConnections.length > 0 || this.activeConnections.size > 0;
  }

  /**
   * Disconnect - for pool, this destroys all connections
   * @returns {Promise<void>}
   */
  async disconnect() {
    await this.destroy();
  }
}

module.exports = OdooConnectionPool;
