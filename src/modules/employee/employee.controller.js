const BaseController = require('../../core/base/BaseController');

/**
 * Employee Controller
 * Handles HTTP requests for Employee operations
 * Extends BaseController with employee-specific endpoints
 */
class EmployeeController extends BaseController {
  /**
   * Create an Employee Controller
   * @param {EmployeeService} service - Employee service instance
   * @param {Object} logger - Logger instance
   */
  constructor(service, logger) {
    super(service, logger);

    // Bind additional methods
    this.getByDepartment = this.getByDepartment.bind(this);
    this.getByManager = this.getByManager.bind(this);
    this.getByJob = this.getByJob.bind(this);
    this.searchByName = this.searchByName.bind(this);
    this.getActive = this.getActive.bind(this);
    this.getByEmail = this.getByEmail.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.reactivate = this.reactivate.bind(this);
  }

  /**
   * Get employees by department (GET /department/:departmentId)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getByDepartment(req, res, next) {
    try {
      const { departmentId } = req.params;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;

      this.logger.info(`GET employees by department: ${departmentId}`);

      const result = await this.service.getByDepartment(
        parseInt(departmentId, 10),
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Failed to get employees by department', error);
      next(error);
    }
  }

  /**
   * Get employees by manager (GET /manager/:managerId)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getByManager(req, res, next) {
    try {
      const { managerId } = req.params;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;

      this.logger.info(`GET employees by manager: ${managerId}`);

      const result = await this.service.getByManager(
        parseInt(managerId, 10),
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Failed to get employees by manager', error);
      next(error);
    }
  }

  /**
   * Get employees by job (GET /job/:jobId)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getByJob(req, res, next) {
    try {
      const { jobId } = req.params;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;

      this.logger.info(`GET employees by job: ${jobId}`);

      const result = await this.service.getByJob(
        parseInt(jobId, 10),
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Failed to get employees by job', error);
      next(error);
    }
  }

  /**
   * Search employees by name (GET /search?name=xxx)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async searchByName(req, res, next) {
    try {
      const { name } = req.query;
      const limit = parseInt(req.query.limit, 10) || 50;

      this.logger.info(`SEARCH employees by name: ${name}`);

      const result = await this.service.searchByName(name, limit);

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Failed to search employees by name', error);
      next(error);
    }
  }

  /**
   * Get active employees (GET /active)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getActive(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;

      this.logger.info('GET active employees');

      const result = await this.service.getActive(page, limit);

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Failed to get active employees', error);
      next(error);
    }
  }

  /**
   * Get employee by email (GET /email/:email)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getByEmail(req, res, next) {
    try {
      const { email } = req.params;

      this.logger.info(`GET employee by email: ${email}`);

      const employee = await this.service.getByEmail(email);

      res.status(200).json({
        success: true,
        data: employee
      });
    } catch (error) {
      this.logger.error('Failed to get employee by email', error);
      next(error);
    }
  }

  /**
   * Deactivate an employee (POST /:id/deactivate)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deactivate(req, res, next) {
    try {
      const { id } = req.params;

      this.logger.info(`POST deactivate employee: ${id}`);

      const result = await this.service.deactivate(parseInt(id, 10));

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Failed to deactivate employee', error);
      next(error);
    }
  }

  /**
   * Reactivate an employee (POST /:id/reactivate)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async reactivate(req, res, next) {
    try {
      const { id } = req.params;

      this.logger.info(`POST reactivate employee: ${id}`);

      const result = await this.service.reactivate(parseInt(id, 10));

      res.status(200).json({
        success: true,
        data: result,
        message: 'Employee reactivated successfully'
      });
    } catch (error) {
      this.logger.error('Failed to reactivate employee', error);
      next(error);
    }
  }
}

module.exports = EmployeeController;
