const morgan = require('morgan');
const { logger } = require('../config/logger.config');

/**
 * Logging Middleware
 * HTTP request/response logging using Morgan
 */

/**
 * Create custom Morgan token for response time in ms
 */
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '0';
  }

  const ms = (res._startAt[0] - req._startAt[0]) * 1000 +
             (res._startAt[1] - req._startAt[1]) / 1000000;

  return ms.toFixed(3);
});

/**
 * Custom Morgan format
 */
const morganFormat = ':method :url :status :response-time-ms ms - :res[content-length]';

/**
 * Morgan middleware for development
 */
const developmentLogger = morgan(morganFormat, {
  stream: logger.stream
});

/**
 * Morgan middleware for production
 * Only log errors (4xx, 5xx)
 */
const productionLogger = morgan(morganFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: logger.stream
});

/**
 * Request ID middleware
 * Adds unique ID to each request for tracing
 */
const requestId = (req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Request details logger
 * Logs detailed request information
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;

    logger.info('Outgoing response', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });

    originalSend.call(this, data);
  };

  next();
};

/**
 * Get appropriate logger based on environment
 */
const getLogger = () => {
  if (process.env.NODE_ENV === 'production') {
    return productionLogger;
  }
  return developmentLogger;
};

module.exports = {
  morganLogger: getLogger(),
  requestId,
  requestLogger
};
