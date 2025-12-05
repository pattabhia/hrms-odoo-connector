const BaseService = require('../../core/base/BaseService');
const { NotFoundError } = require('../../core/errors');

/**
 * Generic Odoo Model Service
 * Adds support for default field selection while reusing BaseService flows
 */
class OdooModelService extends BaseService {
  constructor(repository, options = {}) {
    super(repository, options.validator || null, options.adapter || null, options.logger);
    this.defaultFields = options.defaultFields || [];
  }

  async getAll(page = 1, limit = 50, filters = {}) {
    try {
      this._validatePagination(page, limit);

      const offset = (page - 1) * limit;
      const odooFilters = this._buildOdooFilters(filters);

      const [records, total] = await Promise.all([
        this.repository.findAll(odooFilters, this.defaultFields, limit, offset),
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
      throw error;
    }
  }

  async getById(id) {
    try {
      this._validateId(id);

      this.logger.info(`Getting record by ID: ${id}`);

      const record = await this.repository.findById(id, this.defaultFields);

      if (!record) {
        throw new NotFoundError(`${this.repository.modelName} with ID ${id} not found`);
      }

      return this.adapter ? this.adapter.toDTO(record) : record;
    } catch (error) {
      this.logger.error(`Failed to get record by ID: ${id}`, error);
      if (error.isOperational) throw error;
      throw error;
    }
  }
}

module.exports = OdooModelService;
