const AppError = require('./AppError');

/**
 * Validation Error - thrown when input validation fails
 */
class ValidationError extends AppError {
  /**
   * Create a Validation Error
   * @param {string|Array} errors - Validation error message(s)
   * @param {Object} fields - Optional field-specific errors
   */
  constructor(errors, fields = null) {
    const message = Array.isArray(errors) ? errors.join(', ') : errors;
    super(message, 400, true);

    this.errors = Array.isArray(errors) ? errors : [errors];
    this.fields = fields;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        errors: this.errors,
        ...(this.fields && { fields: this.fields }),
        ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
      }
    };
  }
}

module.exports = ValidationError;
