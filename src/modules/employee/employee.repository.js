const BaseRepository = require('../../core/base/BaseRepository');

/**
 * Employee Repository
 * Handles data access for Employee model in Odoo
 * Extends BaseRepository with employee-specific methods
 */
class EmployeeRepository extends BaseRepository {
  /**
   * Create an Employee Repository
   * @param {IOdooClient} odooClient - Odoo client instance
   * @param {string} modelName - Odoo model name (default: 'hr.employee')
   * @param {Object} logger - Logger instance
   */
  constructor(odooClient, modelName = 'hr.employee', logger) {
    super(odooClient, modelName, logger);
  }

  /**
   * Find employees by department
   * @param {number} departmentId - Department ID
   * @param {Array} fields - Fields to retrieve
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>} Array of employees
   */
  async findByDepartment(departmentId, fields = [], limit = 100) {
    const filters = [['department_id', '=', departmentId]];
    return await this.findBy(filters, fields, limit);
  }

  /**
   * Find employees by manager
   * @param {number} managerId - Manager ID
   * @param {Array} fields - Fields to retrieve
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>} Array of employees
   */
  async findByManager(managerId, fields = [], limit = 100) {
    const filters = [['parent_id', '=', managerId]];
    return await this.findBy(filters, fields, limit);
  }

  /**
   * Find employees by job title
   * @param {number} jobId - Job ID
   * @param {Array} fields - Fields to retrieve
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>} Array of employees
   */
  async findByJob(jobId, fields = [], limit = 100) {
    const filters = [['job_id', '=', jobId]];
    return await this.findBy(filters, fields, limit);
  }

  /**
   * Find active employees
   * @param {Array} fields - Fields to retrieve
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Array of active employees
   */
  async findActive(fields = [], limit = 100, offset = 0) {
    const filters = [['active', '=', true]];
    return await this.findAll(filters, fields, limit, offset);
  }

  /**
   * Search employees by name
   * @param {string} name - Name to search for
   * @param {Array} fields - Fields to retrieve
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>} Array of matching employees
   */
  async searchByName(name, fields = [], limit = 100) {
    const filters = [['name', 'ilike', name]];
    return await this.findBy(filters, fields, limit);
  }

  /**
   * Search employees by email
   * @param {string} email - Email to search for
   * @param {Array} fields - Fields to retrieve
   * @returns {Promise<Object|null>} Employee or null
   */
  async findByEmail(email, fields = []) {
    const filters = [['work_email', '=', email]];
    const results = await this.findBy(filters, fields, 1);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get employee count by department
   * @param {number} departmentId - Department ID
   * @returns {Promise<number>} Count of employees
   */
  async countByDepartment(departmentId) {
    const filters = [['department_id', '=', departmentId]];
    return await this.count(filters);
  }

  /**
   * Get employee count by job
   * @param {number} jobId - Job ID
   * @returns {Promise<number>} Count of employees
   */
  async countByJob(jobId) {
    const filters = [['job_id', '=', jobId]];
    return await this.count(filters);
  }
}

module.exports = EmployeeRepository;
