/**
 * Odoo Client Interface
 * Defines the contract for Odoo client implementations
 * Allows for different Odoo client libraries or mock implementations
 * Following Dependency Inversion Principle (DIP)
 */
class IOdooClient {
  /**
   * Connect to Odoo instance
   * @returns {Promise<void>}
   */
  async connect() {
    throw new Error('Method connect() must be implemented');
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
    throw new Error('Method execute_kw() must be implemented');
  }

  /**
   * Search for records
   * @param {string} model - Odoo model name
   * @param {Array} domain - Search domain
   * @param {Object} options - Search options (limit, offset, order)
   * @returns {Promise<Array>} Array of record IDs
   */
  async search(model, domain = [], options = {}) {
    throw new Error('Method search() must be implemented');
  }

  /**
   * Read records
   * @param {string} model - Odoo model name
   * @param {Array} ids - Record IDs
   * @param {Array} fields - Fields to read
   * @returns {Promise<Array>} Array of records
   */
  async read(model, ids, fields = []) {
    throw new Error('Method read() must be implemented');
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
    throw new Error('Method searchRead() must be implemented');
  }

  /**
   * Create a new record
   * @param {string} model - Odoo model name
   * @param {Object} values - Record values
   * @returns {Promise<number>} Created record ID
   */
  async create(model, values) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Update existing records
   * @param {string} model - Odoo model name
   * @param {Array} ids - Record IDs
   * @param {Object} values - Updated values
   * @returns {Promise<boolean>} Success status
   */
  async write(model, ids, values) {
    throw new Error('Method write() must be implemented');
  }

  /**
   * Delete records
   * @param {string} model - Odoo model name
   * @param {Array} ids - Record IDs
   * @returns {Promise<boolean>} Success status
   */
  async unlink(model, ids) {
    throw new Error('Method unlink() must be implemented');
  }

  /**
   * Disconnect from Odoo instance
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('Method disconnect() must be implemented');
  }

  /**
   * Check if client is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    throw new Error('Method isConnected() must be implemented');
  }
}

module.exports = IOdooClient;
