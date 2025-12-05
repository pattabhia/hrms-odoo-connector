const IService = require('../interfaces/IService');
const { ServiceError, ValidationError, NotFoundError } = require('../errors');

/**
 * Base Service Class
 * Implements common business logic patterns
 * Following Service Layer Pattern and Single Responsibility Principle
 * All module-specific services should extend this class
 */
class BaseService extends IService {
  /**
   * Create a Base Service
   * @param {IRepository} repository - Repository instance
   * @param {Object} validator - Validator instance
   * @param {Object} adapter - Adapter instance for data transformation
   * @param {Object} logger - Logger instance
   */
  constructor(repository, validator = null, adapter = null, logger = console) {
    super();

    if (!repository) {
      throw new Error('Repository is required for BaseService');
    }

    this.repository = repository;
    this.validator = validator;
    this.adapter = adapter;
    this.logger = logger;
  }

  /**
   * Get all records with pagination
   * @param {number} page - Page number
   * @param {number} limit - Records per page
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Paginated results
   */
  async getAll(page = 1, limit = 50, filters = {}) {
    try {
      this._validatePagination(page, limit);

      this.logger.info('Getting all records', { page, limit, filters });

      const offset = (page - 1) * limit;
      const odooFilters = this._buildOdooFilters(filters);

      const [records, total] = await Promise.all([
        this.repository.findAll(odooFilters, [], limit, offset),
        this.repository.count(odooFilters)
      ]);

      const transformedRecords = this.adapter
        ? records.map((record) => this.adapter.toDTO(record))
        : records;

      return {
        success: true,
        data: transformedRecords,
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
      this.logger.error('Failed to get all records', error);
      if (error.isOperational) throw error;
      throw new ServiceError('Failed to fetch records', error);
    }
  }

  /**
   * Get a single record by ID
   * @param {number} id - Record ID
   * @returns {Promise<Object>} Record object
   */
  async getById(id) {
    try {
      this._validateId(id);

      this.logger.info(`Getting record by ID: ${id}`);

      const record = await this.repository.findById(id);

      if (!record) {
        throw new NotFoundError(
          `Record with ID ${id} not found`,
          this.repository.modelName,
          id
        );
      }

      return this.adapter ? this.adapter.toDTO(record) : record;
    } catch (error) {
      this.logger.error(`Failed to get record by ID: ${id}`, error);
      if (error.isOperational) throw error;
      throw new ServiceError(`Failed to fetch record with ID ${id}`, error);
    }
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    try {
      this.logger.info('Creating new record', { data });

      // Validate input if validator is provided
      if (this.validator) {
        const validationResult = this.validator.validate(data);
        if (!validationResult.isValid) {
          throw new ValidationError(validationResult.errors, validationResult.fields);
        }
      }

      // Transform to Odoo format if adapter is provided
      const odooData = this.adapter ? this.adapter.toOdooFormat(data) : data;

      // Create in repository
      const recordId = await this.repository.create(odooData);

      // Fetch and return the created record
      return await this.getById(recordId);
    } catch (error) {
      this.logger.error('Failed to create record', error);
      if (error.isOperational) throw error;
      throw new ServiceError('Failed to create record', error);
    }
  }

  /**
   * Update an existing record
   * @param {number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async update(id, data) {
    try {
      this._validateId(id);

      this.logger.info(`Updating record ID: ${id}`, { data });

      // Check if record exists
      await this.getById(id);

      // Validate update data if validator is provided
      if (this.validator && this.validator.validateUpdate) {
        const validationResult = this.validator.validateUpdate(data);
        if (!validationResult.isValid) {
          throw new ValidationError(validationResult.errors, validationResult.fields);
        }
      }

      // Transform to Odoo format if adapter is provided
      const odooData = this.adapter ? this.adapter.toOdooFormat(data) : data;

      // Update in repository
      await this.repository.update(id, odooData);

      // Fetch and return the updated record
      return await this.getById(id);
    } catch (error) {
      this.logger.error(`Failed to update record ID: ${id}`, error);
      if (error.isOperational) throw error;
      throw new ServiceError(`Failed to update record with ID ${id}`, error);
    }
  }

  /**
   * Delete a record
   * @param {number} id - Record ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(id) {
    try {
      this._validateId(id);

      this.logger.info(`Deleting record ID: ${id}`);

      // Check if record exists
      await this.getById(id);

      // Delete from repository
      await this.repository.delete(id);

      return {
        success: true,
        message: `Record with ID ${id} deleted successfully`
      };
    } catch (error) {
      this.logger.error(`Failed to delete record ID: ${id}`, error);
      if (error.isOperational) throw error;
      throw new ServiceError(`Failed to delete record with ID ${id}`, error);
    }
  }

  /**
   * Validate ID parameter
   * @private
   * @param {number} id - ID to validate
   */
  _validateId(id) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new ValidationError('Invalid ID: must be a positive integer');
    }
  }

  /**
   * Validate pagination parameters
   * @private
   * @param {number} page - Page number
   * @param {number} limit - Records per page
   */
  _validatePagination(page, limit) {
    const numericPage = Number(page);
    const numericLimit = Number(limit);

    if (!Number.isInteger(numericPage) || numericPage < 1) {
      throw new ValidationError('Invalid page: must be a positive integer');
    }

    if (!Number.isInteger(numericLimit) || numericLimit < 1 || numericLimit > 100) {
      throw new ValidationError('Invalid limit: must be between 1 and 100');
    }
  }

  /**
   * Build Odoo filters from query parameters
   * @private
   * @param {Object} filters - Filter object
   * @returns {Array} Odoo domain filters
   */
  _buildOdooFilters(filters) {
    const odooFilters = [];

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        odooFilters.push([key, '=', filters[key]]);
      }
    });

    return odooFilters;
  }
}

module.exports = BaseService;
