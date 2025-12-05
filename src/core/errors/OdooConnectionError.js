const AppError = require('./AppError');

/**
 * Odoo Connection Error - thrown when connection to Odoo fails
 */
class OdooConnectionError extends AppError {
  /**
   * Create an Odoo Connection Error
   * @param {string} message - Error message
   * @param {Error} originalError - Original error from Odoo client
   */
  constructor(message = 'Failed to connect to Odoo', originalError = null) {
    super(message, 503, true);

    this.originalError = originalError;
    this.retryable = true; // Indicate this error is retryable
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        retryable: this.retryable,
        ...(process.env.NODE_ENV === 'development' && {
          stack: this.stack,
          originalError: this.originalError?.message
        })
      }
    };
  }
}

module.exports = OdooConnectionError;
