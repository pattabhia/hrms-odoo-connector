const Odoo = require('odoo-xmlrpc');
const IOdooClient = require('../../core/interfaces/IOdooClient');
const { OdooConnectionError } = require('../../core/errors');

/**
 * Odoo Client Implementation
 * Wraps odoo-xmlrpc library and implements IOdooClient interface
 * Follows Adapter Pattern and Dependency Inversion Principle
 */
class OdooClient extends IOdooClient {
  /**
   * Create an Odoo Client
   * @param {Object} config - Odoo configuration
   * @param {Object} logger - Logger instance
   */
  constructor(config, logger = console) {
    super();

    this.config = config;
    this.logger = logger;
    this.odoo = null;
    this.uid = null;
    this.connected = false;
  }

  /**
   * Connect to Odoo instance and authenticate
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.connected && this.uid) {
      return;
    }

    try {
      this.logger.info('Connecting to Odoo...', {
        connection: this.config.getConnectionString()
      });

      // Create Odoo instance
      // Note: odoo-xmlrpc expects full URL with protocol (e.g., https://example.com)
      this.odoo = new Odoo({
        url: this.config.getUrl(),
        port: this.config.port,
        db: this.config.database,
        username: this.config.username,
        password: this.config.password
      });

      // Authenticate with retry logic
      this.uid = await this._authenticateWithRetry();

      this.connected = true;

      this.logger.info('Successfully connected to Odoo', {
        uid: this.uid,
        database: this.config.database
      });
    } catch (error) {
      this.logger.error('Failed to connect to Odoo', error);
      throw new OdooConnectionError('Failed to connect to Odoo', error);
    }
  }

  /**
   * Authenticate with retry logic
   * @private
   * @returns {Promise<number>} User ID
   */
  async _authenticateWithRetry() {
    const { maxAttempts, delayMs, backoffMultiplier } = this.config.retry;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.info(`Authentication attempt ${attempt}/${maxAttempts}`);

        return await new Promise((resolve, reject) => {
          this.odoo.connect((err, uid) => {
            if (err) {
              reject(err);
            } else {
              resolve(uid);
            }
          });
        });
      } catch (error) {
        lastError = error;
        this.logger.warn(`Authentication attempt ${attempt} failed`, error);

        if (attempt < maxAttempts) {
          const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
          this.logger.info(`Retrying in ${delay}ms...`);
          await this._sleep(delay);
        }
      }
    }

    throw new OdooConnectionError(
      `Failed to authenticate after ${maxAttempts} attempts`,
      lastError
    );
  }

  /**
   * Execute Odoo RPC method
   * @param {string} model - Odoo model name
   * @param {string} method - Method name
   * @param {Array} params - Method parameters
   * @param {Object} kwargs - Keyword arguments
   * @returns {Promise<any>} Method result
   */
  async execute_kw(model, method, params = [], kwargs = {}) {
    await this.connect();

    try {
      this.logger.debug(`Executing ${model}.${method}`, { params, kwargs });

      // Build final params array: [params, kwargs] if kwargs exists, otherwise just [params]
      const finalParams = Object.keys(kwargs).length > 0 ? [params, kwargs] : [params];

      return await new Promise((resolve, reject) => {
        this.odoo.execute_kw(model, method, finalParams, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    } catch (error) {
      this.logger.error(`Failed to execute ${model}.${method}`, error);
      throw new OdooConnectionError(`Failed to execute ${model}.${method}`, error);
    }
  }

  /**
   * Search for records
   * @param {string} model - Odoo model name
   * @param {Array} domain - Search domain
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of record IDs
   */
  async search(model, domain = [], options = {}) {
    return await this.execute_kw(model, 'search', [domain], options);
  }

  /**
   * Read records
   * @param {string} model - Odoo model name
   * @param {Array} ids - Record IDs
   * @param {Array} fields - Fields to read
   * @returns {Promise<Array>} Array of records
   */
  async read(model, ids, fields = []) {
    const kwargs = fields.length > 0 ? { fields } : {};
    return await this.execute_kw(model, 'read', [ids], kwargs);
  }

  /**
   * Search and read records in one call
   * @param {string} model - Odoo model name
   * @param {Array} domain - Search domain
   * @param {Array} fields - Fields to read
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of records
   */
  async searchRead(model, domain = [], fields = [], options = {}) {
    const kwargs = { ...options };
    if (fields.length > 0) {
      kwargs.fields = fields;
    }
    return await this.execute_kw(model, 'search_read', [domain], kwargs);
  }

  /**
   * Create a new record
   * @param {string} model - Odoo model name
   * @param {Object} values - Record values
   * @returns {Promise<number>} Created record ID
   */
  async create(model, values) {
    return await this.execute_kw(model, 'create', [values]);
  }

  /**
   * Update existing records
   * @param {string} model - Odoo model name
   * @param {Array} ids - Record IDs
   * @param {Object} values - Updated values
   * @returns {Promise<boolean>} Success status
   */
  async write(model, ids, values) {
    return await this.execute_kw(model, 'write', [ids, values]);
  }

  /**
   * Delete records
   * @param {string} model - Odoo model name
   * @param {Array} ids - Record IDs
   * @returns {Promise<boolean>} Success status
   */
  async unlink(model, ids) {
    return await this.execute_kw(model, 'unlink', [ids]);
  }

  /**
   * Disconnect from Odoo instance
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.connected) {
      this.logger.info('Disconnecting from Odoo');
      this.connected = false;
      this.uid = null;
      this.odoo = null;
    }
  }

  /**
   * Check if client is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected && this.uid !== null;
  }

  /**
   * Sleep utility for retry logic
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = OdooClient;
