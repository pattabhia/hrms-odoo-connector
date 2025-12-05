/**
 * Base Controller Class
 * Implements common HTTP request handling patterns
 * Following Controller Pattern and Single Responsibility Principle
 * Controllers should only handle HTTP concerns, delegate business logic to services
 * All module-specific controllers should extend this class
 */
class BaseController {
  /**
   * Create a Base Controller
   * @param {IService} service - Service instance
   * @param {Object} logger - Logger instance
   */
  constructor(service, logger = console) {
    if (!service) {
      throw new Error('Service is required for BaseController');
    }

    this.service = service;
    this.logger = logger;

    // Bind methods to preserve 'this' context when used as route handlers
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * Get all records (GET /)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;

      // Extract filters from query parameters (excluding page and limit)
      const { page: _, limit: __, ...filters } = req.query;

      this.logger.info('GET all records', { page, limit, filters });

      const result = await this.service.getAll(page, limit, filters);

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Failed to get all records', error);
      next(error);
    }
  }

  /**
   * Get a single record by ID (GET /:id)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      this.logger.info(`GET record by ID: ${id}`);

      const record = await this.service.getById(parseInt(id, 10));

      res.status(200).json({
        success: true,
        data: record
      });
    } catch (error) {
      this.logger.error(`Failed to get record by ID: ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * Create a new record (POST /)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async create(req, res, next) {
    try {
      this.logger.info('POST create new record', { body: req.body });

      const record = await this.service.create(req.body);

      res.status(201).json({
        success: true,
        data: record,
        message: 'Record created successfully'
      });
    } catch (error) {
      this.logger.error('Failed to create record', error);
      next(error);
    }
  }

  /**
   * Update an existing record (PUT /:id)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      this.logger.info(`PUT update record ID: ${id}`, { body: req.body });

      const record = await this.service.update(parseInt(id, 10), req.body);

      res.status(200).json({
        success: true,
        data: record,
        message: 'Record updated successfully'
      });
    } catch (error) {
      this.logger.error(`Failed to update record ID: ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * Partially update an existing record (PATCH /:id)
   * Uses the same service method as PUT
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async patch(req, res, next) {
    try {
      const { id } = req.params;

      this.logger.info(`PATCH update record ID: ${id}`, { body: req.body });

      const record = await this.service.update(parseInt(id, 10), req.body);

      res.status(200).json({
        success: true,
        data: record,
        message: 'Record updated successfully'
      });
    } catch (error) {
      this.logger.error(`Failed to patch record ID: ${req.params.id}`, error);
      next(error);
    }
  }

  /**
   * Delete a record (DELETE /:id)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      this.logger.info(`DELETE record ID: ${id}`);

      const result = await this.service.delete(parseInt(id, 10));

      res.status(200).json(result);
    } catch (error) {
      this.logger.error(`Failed to delete record ID: ${req.params.id}`, error);
      next(error);
    }
  }
}

module.exports = BaseController;
