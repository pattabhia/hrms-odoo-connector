const BaseService = require('../../core/base/BaseService');
const { NotFoundError, ValidationError } = require('../../core/errors');

/**
 * Employee Service
 * Implements business logic for Employee operations
 * Extends BaseService with employee-specific functionality
 */
class EmployeeService extends BaseService {
  /**
   * Create an Employee Service
   * @param {EmployeeRepository} repository - Employee repository instance
   * @param {EmployeeValidator} validator - Employee validator instance
   * @param {EmployeeAdapter} adapter - Employee adapter instance
   * @param {Object} logger - Logger instance
   */
  constructor(repository, validator, adapter, logger) {
    super(repository, validator, adapter, logger);
  }

  /**
   * Get employees by department
   * @param {number} departmentId - Department ID
   * @param {number} page - Page number
   * @param {number} limit - Records per page
   * @returns {Promise<Object>} Paginated employees
   */
  async getByDepartment(departmentId, page = 1, limit = 50) {
    try {
      this._validateId(departmentId);
      this._validatePagination(page, limit);

      this.logger.info(`Getting employees for department ${departmentId}`);

      const offset = (page - 1) * limit;
      const [employees, total] = await Promise.all([
        this.repository.findByDepartment(departmentId, [], limit),
        this.repository.countByDepartment(departmentId)
      ]);

      return {
        success: true,
        data: this.adapter.toDTOArray(employees),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get employees by department ${departmentId}`, error);
      throw error;
    }
  }

  /**
   * Get employees by manager
   * @param {number} managerId - Manager ID
   * @param {number} page - Page number
   * @param {number} limit - Records per page
   * @returns {Promise<Object>} Paginated employees
   */
  async getByManager(managerId, page = 1, limit = 50) {
    try {
      this._validateId(managerId);
      this._validatePagination(page, limit);

      this.logger.info(`Getting employees for manager ${managerId}`);

      const employees = await this.repository.findByManager(managerId, [], limit);

      return {
        success: true,
        data: this.adapter.toDTOArray(employees),
        total: employees.length
      };
    } catch (error) {
      this.logger.error(`Failed to get employees by manager ${managerId}`, error);
      throw error;
    }
  }

  /**
   * Get employees by job
   * @param {number} jobId - Job ID
   * @param {number} page - Page number
   * @param {number} limit - Records per page
   * @returns {Promise<Object>} Paginated employees
   */
  async getByJob(jobId, page = 1, limit = 50) {
    try {
      this._validateId(jobId);
      this._validatePagination(page, limit);

      this.logger.info(`Getting employees for job ${jobId}`);

      const [employees, total] = await Promise.all([
        this.repository.findByJob(jobId, [], limit),
        this.repository.countByJob(jobId)
      ]);

      return {
        success: true,
        data: this.adapter.toDTOArray(employees),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get employees by job ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Search employees by name
   * @param {string} name - Name to search for
   * @param {number} limit - Maximum results
   * @returns {Promise<Object>} Search results
   */
  async searchByName(name, limit = 50) {
    try {
      if (!name || name.trim() === '') {
        throw new ValidationError('Search name cannot be empty');
      }

      this.logger.info(`Searching employees by name: ${name}`);

      const employees = await this.repository.searchByName(name, [], limit);

      return {
        success: true,
        data: this.adapter.toDTOArray(employees),
        total: employees.length
      };
    } catch (error) {
      this.logger.error(`Failed to search employees by name: ${name}`, error);
      throw error;
    }
  }

  /**
   * Get active employees
   * @param {number} page - Page number
   * @param {number} limit - Records per page
   * @returns {Promise<Object>} Paginated active employees
   */
  async getActive(page = 1, limit = 50) {
    try {
      this._validatePagination(page, limit);

      this.logger.info('Getting active employees');

      const offset = (page - 1) * limit;
      const [employees, total] = await Promise.all([
        this.repository.findActive([], limit, offset),
        this.repository.count([['active', '=', true]])
      ]);

      return {
        success: true,
        data: this.adapter.toDTOArray(employees),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      this.logger.error('Failed to get active employees', error);
      throw error;
    }
  }

  /**
   * Get employee by email
   * @param {string} email - Employee email
   * @returns {Promise<Object>} Employee or null
   */
  async getByEmail(email) {
    try {
      if (!email || email.trim() === '') {
        throw new ValidationError('Email cannot be empty');
      }

      this.logger.info(`Getting employee by email: ${email}`);

      const employee = await this.repository.findByEmail(email);

      if (!employee) {
        throw new NotFoundError(
          `Employee with email ${email} not found`,
          'Employee',
          email
        );
      }

      return this.adapter.toDTO(employee);
    } catch (error) {
      this.logger.error(`Failed to get employee by email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Deactivate an employee (soft delete)
   * @param {number} id - Employee ID
   * @returns {Promise<Object>} Result
   */
  async deactivate(id) {
    try {
      this._validateId(id);

      this.logger.info(`Deactivating employee ${id}`);

      // Check if employee exists
      await this.getById(id);

      // Update active status
      await this.repository.update(id, { active: false });

      return {
        success: true,
        message: `Employee ${id} deactivated successfully`
      };
    } catch (error) {
      this.logger.error(`Failed to deactivate employee ${id}`, error);
      throw error;
    }
  }

  /**
   * Reactivate an employee
   * @param {number} id - Employee ID
   * @returns {Promise<Object>} Result
   */
  async reactivate(id) {
    try {
      this._validateId(id);

      this.logger.info(`Reactivating employee ${id}`);

      // Update active status
      await this.repository.update(id, { active: true });

      // Fetch and return updated employee
      return await this.getById(id);
    } catch (error) {
      this.logger.error(`Failed to reactivate employee ${id}`, error);
      throw error;
    }
  }
}

module.exports = EmployeeService;
