const IRepository = require('../interfaces/IRepository');
const { RepositoryError } = require('../errors');

/**
 * Base Repository Class
 * Implements common data access patterns for Odoo models
 * Following Repository Pattern and Open/Closed Principle
 * All model-specific repositories should extend this class
 */
class BaseRepository extends IRepository {
  /**
   * Create a Base Repository
   * @param {IOdooClient} odooClient - Odoo client instance
   * @param {string} modelName - Odoo model name (e.g., 'hr.employee')
   * @param {Object} logger - Logger instance
   */
  constructor(odooClient, modelName, logger = console) {
    super();

    if (!odooClient) {
      throw new Error('OdooClient is required for BaseRepository');
    }
    if (!modelName) {
      throw new Error('ModelName is required for BaseRepository');
    }

    this.odooClient = odooClient;
    this.modelName = modelName;
    this.logger = logger;
  }

  /**
   * Find all records with optional filters
   * @param {Array} filters - Odoo domain filters
   * @param {Array} fields - Fields to retrieve
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Array of records
   */
  async findAll(filters = [], fields = [], limit = 100, offset = 0) {
    try {
      this.logger.info(`[${this.modelName}] Finding all records`, {
        filters,
        limit,
        offset
      });

      await this.odooClient.connect();

      const records = await this.odooClient.execute_kw(
        this.modelName,
        'search_read',
        [filters],
        {
          fields: fields.length > 0 ? fields : undefined,
          limit,
          offset
        }
      );

      this.logger.info(`[${this.modelName}] Found ${records.length} records`);
      return records;
    } catch (error) {
      this.logger.error(`[${this.modelName}] Failed to find all records`, error);
      throw new RepositoryError(
        `Failed to fetch ${this.modelName} records`,
        error,
        'findAll'
      );
    }
  }

  /**
   * Find a single record by ID
   * @param {number} id - Record ID
   * @param {Array} fields - Fields to retrieve
   * @returns {Promise<Object|null>} Record object or null
   */
  async findById(id, fields = []) {
    try {
      this.logger.info(`[${this.modelName}] Finding record by ID: ${id}`);

      await this.odooClient.connect();

      const result = await this.odooClient.execute_kw(
        this.modelName,
        'read',
        [[id]],
        { fields: fields.length > 0 ? fields : undefined }
      );

      const record = result && result.length > 0 ? result[0] : null;

      if (record) {
        this.logger.info(`[${this.modelName}] Found record with ID: ${id}`);
      } else {
        this.logger.warn(`[${this.modelName}] No record found with ID: ${id}`);
      }

      return record;
    } catch (error) {
      this.logger.error(`[${this.modelName}] Failed to find record by ID: ${id}`, error);
      throw new RepositoryError(
        `Failed to fetch ${this.modelName} by ID ${id}`,
        error,
        'findById'
      );
    }
  }

  /**
   * Find records matching specific criteria
   * @param {Array} filters - Odoo domain filters
   * @param {Array} fields - Fields to retrieve
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>} Array of matching records
   */
  async findBy(filters, fields = [], limit = 100) {
    try {
      this.logger.info(`[${this.modelName}] Finding records by criteria`, {
        filters,
        limit
      });

      return await this.findAll(filters, fields, limit, 0);
    } catch (error) {
      this.logger.error(`[${this.modelName}] Failed to find records by criteria`, error);
      throw new RepositoryError(
        `Failed to fetch ${this.modelName} by criteria`,
        error,
        'findBy'
      );
    }
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<number>} ID of created record
   */
  async create(data) {
    try {
      this.logger.info(`[${this.modelName}] Creating new record`, { data });

      await this.odooClient.connect();

      const recordId = await this.odooClient.execute_kw(
        this.modelName,
        'create',
        [data]
      );

      this.logger.info(`[${this.modelName}] Created record with ID: ${recordId}`);
      return recordId;
    } catch (error) {
      this.logger.error(`[${this.modelName}] Failed to create record`, error);
      throw new RepositoryError(
        `Failed to create ${this.modelName} record`,
        error,
        'create'
      );
    }
  }

  /**
   * Update an existing record
   * @param {number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<boolean>} Success status
   */
  async update(id, data) {
    try {
      this.logger.info(`[${this.modelName}] Updating record ID: ${id}`, { data });

      await this.odooClient.connect();

      const success = await this.odooClient.execute_kw(
        this.modelName,
        'write',
        [[id], data]
      );

      this.logger.info(`[${this.modelName}] Updated record ID: ${id}`, {
        success
      });
      return success;
    } catch (error) {
      this.logger.error(`[${this.modelName}] Failed to update record ID: ${id}`, error);
      throw new RepositoryError(
        `Failed to update ${this.modelName} record with ID ${id}`,
        error,
        'update'
      );
    }
  }

  /**
   * Delete a record
   * @param {number} id - Record ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      this.logger.info(`[${this.modelName}] Deleting record ID: ${id}`);

      await this.odooClient.connect();

      const success = await this.odooClient.execute_kw(
        this.modelName,
        'unlink',
        [[id]]
      );

      this.logger.info(`[${this.modelName}] Deleted record ID: ${id}`, {
        success
      });
      return success;
    } catch (error) {
      this.logger.error(`[${this.modelName}] Failed to delete record ID: ${id}`, error);
      throw new RepositoryError(
        `Failed to delete ${this.modelName} record with ID ${id}`,
        error,
        'delete'
      );
    }
  }

  /**
   * Count records matching filters
   * @param {Array} filters - Odoo domain filters
   * @returns {Promise<number>} Count of records
   */
  async count(filters = []) {
    try {
      this.logger.info(`[${this.modelName}] Counting records`, { filters });

      await this.odooClient.connect();

      const count = await this.odooClient.execute_kw(
        this.modelName,
        'search_count',
        [filters]
      );

      this.logger.info(`[${this.modelName}] Count: ${count}`);
      return count;
    } catch (error) {
      this.logger.error(`[${this.modelName}] Failed to count records`, error);
      throw new RepositoryError(
        `Failed to count ${this.modelName} records`,
        error,
        'count'
      );
    }
  }

  /**
   * Check if a record exists
   * @param {number} id - Record ID
   * @returns {Promise<boolean>} Existence status
   */
  async exists(id) {
    try {
      this.logger.info(`[${this.modelName}] Checking if record exists: ${id}`);

      const record = await this.findById(id, ['id']);
      const exists = record !== null;

      this.logger.info(`[${this.modelName}] Record ${id} exists: ${exists}`);
      return exists;
    } catch (error) {
      this.logger.error(`[${this.modelName}] Failed to check existence of record: ${id}`, error);
      return false;
    }
  }
}

module.exports = BaseRepository;
