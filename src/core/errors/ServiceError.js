const AppError = require('./AppError');

/**
 * Service Error - thrown when business logic operations fail
 */
class ServiceError extends AppError {
  /**
   * Create a Service Error
   * @param {string} message - Error message
   * @param {Error} originalError - Original error from lower layers
   * @param {string} service - The service that failed
   */
  constructor(message = 'Service operation failed', originalError = null, service = null) {
    super(message, 500, true);

    this.originalError = originalError;
    this.service = service;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(this.service && { service: this.service }),
        ...(process.env.NODE_ENV === 'development' && {
          stack: this.stack,
          originalError: this.originalError?.message
        })
      }
    };
  }
}

module.exports = ServiceError;
