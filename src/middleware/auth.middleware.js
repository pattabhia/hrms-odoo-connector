const jwt = require('jsonwebtoken');
const { AppError } = require('../core/errors');
const { createLogger } = require('../infrastructure/logging/Logger');
const config = require('../config');

const logger = createLogger('AuthMiddleware');

/**
 * Authentication Middleware
 * Validates JWT tokens and protects routes
 */

/**
 * Verify JWT token
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.security.jwtSecret);

    // Attach user info to request
    req.user = decoded;

    logger.debug('User authenticated', {
      userId: decoded.userId,
      email: decoded.email
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error.message,
      ip: req.ip
    });

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }

    next(error);
  }
};

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.security.jwtSecret);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = config.security.jwtExpiresIn) => {
  return jwt.sign(payload, config.security.jwtSecret, { expiresIn });
};

/**
 * Verify token without middleware
 * @param {string} token - JWT token
 * @returns {Object} Decoded token
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.security.jwtSecret);
};

module.exports = {
  authenticate,
  optionalAuth,
  generateToken,
  verifyToken
};
