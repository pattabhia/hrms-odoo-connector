/**
 * Repository Interface
 * Defines the contract for all repository implementations
 * Following Interface Segregation Principle (ISP)
 */
class IRepository {
  /**
   * Find all records with optional filters
   * @param {Array} filters - Odoo domain filters
   * @param {Array} fields - Fields to retrieve
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Array of records
   */
  async findAll(filters = [], fields = [], limit = 100, offset = 0) {
    throw new Error('Method findAll() must be implemented');
  }

  /**
   * Find a single record by ID
   * @param {number} id - Record ID
   * @param {Array} fields - Fields to retrieve
   * @returns {Promise<Object|null>} Record object or null
   */
  async findById(id, fields = []) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * Find records matching specific criteria
   * @param {Array} filters - Odoo domain filters
   * @param {Array} fields - Fields to retrieve
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>} Array of matching records
   */
  async findBy(filters, fields = [], limit = 100) {
    throw new Error('Method findBy() must be implemented');
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<number>} ID of created record
   */
  async create(data) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Update an existing record
   * @param {number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<boolean>} Success status
   */
  async update(id, data) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Delete a record
   * @param {number} id - Record ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Count records matching filters
   * @param {Array} filters - Odoo domain filters
   * @returns {Promise<number>} Count of records
   */
  async count(filters = []) {
    throw new Error('Method count() must be implemented');
  }

  /**
   * Check if a record exists
   * @param {number} id - Record ID
   * @returns {Promise<boolean>} Existence status
   */
  async exists(id) {
    throw new Error('Method exists() must be implemented');
  }
}

module.exports = IRepository;
