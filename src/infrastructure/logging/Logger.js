const { logger } = require('../../config/logger.config');

/**
 * Logger Wrapper
 * Wraps Winston logger with additional context and metadata support
 * Provides structured logging throughout the application
 */
class Logger {
  /**
   * Create a Logger
   * @param {string} context - Logger context (e.g., module name, class name)
   */
  constructor(context = 'Application') {
    this.context = context;
    this.logger = logger;
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.logger.info(message, {
      context: this.context,
      ...meta
    });
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Error|Object} error - Error object or metadata
   */
  error(message, error = null) {
    const meta = {
      context: this.context
    };

    if (error instanceof Error) {
      meta.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    } else if (error) {
      meta.error = error;
    }

    this.logger.error(message, meta);
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.logger.warn(message, {
      context: this.context,
      ...meta
    });
  }

  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this.logger.debug(message, {
      context: this.context,
      ...meta
    });
  }

  /**
   * Log verbose message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  verbose(message, meta = {}) {
    this.logger.verbose(message, {
      context: this.context,
      ...meta
    });
  }

  /**
   * Create a child logger with additional context
   * @param {string} childContext - Additional context
   * @returns {Logger} Child logger
   */
  child(childContext) {
    return new Logger(`${this.context}:${childContext}`);
  }

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {Object} meta - Additional metadata
   */
  logRequest(req, meta = {}) {
    this.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      ...meta
    });
  }

  /**
   * Log HTTP response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} duration - Request duration in ms
   */
  logResponse(req, res, duration) {
    const level = res.statusCode >= 400 ? 'error' : 'info';

    this.logger[level]('HTTP Response', {
      context: this.context,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress
    });
  }
}

/**
 * Create a logger instance for a specific context
 * @param {string} context - Logger context
 * @returns {Logger} Logger instance
 */
function createLogger(context) {
  return new Logger(context);
}

module.exports = {
  Logger,
  createLogger
};
