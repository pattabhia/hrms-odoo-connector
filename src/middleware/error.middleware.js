const { AppError } = require('../core/errors');
const { createLogger } = require('../infrastructure/logging/Logger');

const logger = createLogger('ErrorMiddleware');

/**
 * Error Handler Middleware
 * Centralized error handling following best practices
 * Handles both operational and programming errors
 */

/**
 * Handle 404 - Not Found
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404
  );
  next(error);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Operational errors (expected errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Programming errors (unexpected errors)
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: {
        name: 'InternalServerError',
        message: 'An unexpected error occurred',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Development: Send detailed error
  return res.status(err.statusCode || 500).json({
    error: {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode || 500,
      timestamp: new Date().toISOString(),
      stack: err.stack
    }
  });
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors
 * Usage: router.get('/', asyncHandler(async (req, res) => {...}))
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });

  // Exit process - uncaught exceptions are critical
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason,
    promise
  });

  // Exit process in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler
};
