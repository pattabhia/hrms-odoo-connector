const AppError = require('./AppError');

/**
 * Repository Error - thrown when data access operations fail
 */
class RepositoryError extends AppError {
  /**
   * Create a Repository Error
   * @param {string} message - Error message
   * @param {Error} originalError - Original error from data layer
   * @param {string} operation - The operation that failed (e.g., 'findById', 'create')
   */
  constructor(message = 'Repository operation failed', originalError = null, operation = null) {
    super(message, 500, true);

    this.originalError = originalError;
    this.operation = operation;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(this.operation && { operation: this.operation }),
        ...(process.env.NODE_ENV === 'development' && {
          stack: this.stack,
          originalError: this.originalError?.message
        })
      }
    };
  }
}

module.exports = RepositoryError;
