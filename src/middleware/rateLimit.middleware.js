const rateLimit = require('express-rate-limit');
const { createLogger } = require('../infrastructure/logging/Logger');
const config = require('../config');

const logger = createLogger('RateLimitMiddleware');

/**
 * Rate Limiting Middleware
 * Protects API from abuse and DDoS attacks
 */

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: {
      name: 'RateLimitError',
      message: 'Too many requests from this IP, please try again later',
      statusCode: 429,
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method
    });

    res.status(429).json({
      error: {
        name: 'RateLimitError',
        message: 'Too many requests from this IP, please try again later',
        statusCode: 429,
        timestamp: new Date().toISOString(),
        retryAfter: res.getHeader('Retry-After')
      }
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: {
      name: 'RateLimitError',
      message: 'Too many authentication attempts, please try again later',
      statusCode: 429,
      timestamp: new Date().toISOString()
    }
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method
    });

    res.status(429).json({
      error: {
        name: 'RateLimitError',
        message: 'Too many authentication attempts, please try again later',
        statusCode: 429,
        timestamp: new Date().toISOString(),
        retryAfter: res.getHeader('Retry-After')
      }
    });
  }
});

/**
 * Strict rate limiter for creation endpoints
 */
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 creations per hour
  message: {
    error: {
      name: 'RateLimitError',
      message: 'Too many create requests, please try again later',
      statusCode: 429,
      timestamp: new Date().toISOString()
    }
  },
  handler: (req, res) => {
    logger.warn('Create rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method
    });

    res.status(429).json({
      error: {
        name: 'RateLimitError',
        message: 'Too many create requests, please try again later',
        statusCode: 429,
        timestamp: new Date().toISOString(),
        retryAfter: res.getHeader('Retry-After')
      }
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  createLimiter
};
