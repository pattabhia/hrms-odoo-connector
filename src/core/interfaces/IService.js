/**
 * Service Interface
 * Defines the contract for all service implementations
 * Services contain business logic and orchestrate repository operations
 * Following Interface Segregation Principle (ISP)
 */
class IService {
  /**
   * Get all records with pagination
   * @param {number} page - Page number
   * @param {number} limit - Records per page
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Paginated results
   */
  async getAll(page = 1, limit = 50, filters = {}) {
    throw new Error('Method getAll() must be implemented');
  }

  /**
   * Get a single record by ID
   * @param {number} id - Record ID
   * @returns {Promise<Object>} Record object
   */
  async getById(id) {
    throw new Error('Method getById() must be implemented');
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Update an existing record
   * @param {number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async update(id, data) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Delete a record
   * @param {number} id - Record ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(id) {
    throw new Error('Method delete() must be implemented');
  }
}

module.exports = IService;
