const AppError = require('./AppError');

/**
 * Not Found Error - thrown when a resource is not found
 */
class NotFoundError extends AppError {
  /**
   * Create a Not Found Error
   * @param {string} message - Error message
   * @param {string} resource - Resource type that was not found
   * @param {any} identifier - Identifier used to search for the resource
   */
  constructor(message = 'Resource not found', resource = null, identifier = null) {
    super(message, 404, true);

    this.resource = resource;
    this.identifier = identifier;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(this.resource && { resource: this.resource }),
        ...(this.identifier && { identifier: this.identifier }),
        ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
      }
    };
  }
}

module.exports = NotFoundError;
