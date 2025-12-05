require('dotenv').config();

/**
 * Main Application Configuration
 * Centralized configuration management following best practices
 */

const config = {
  // Application settings
  app: {
    name: process.env.APP_NAME || 'HRMS Odoo Connector',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    apiPrefix: process.env.API_PREFIX || '/api/v1'
  },

  // Odoo configuration
  odoo: require('./odoo.config'),

  // Database configuration (if using local DB for caching/sessions)
  database: require('./database.config'),

  // Logger configuration
  logger: require('./logger.config'),

  // Security settings
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100 // max requests per window
  },

  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true' || false
  },

  // Redis configuration (for caching)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    ttl: parseInt(process.env.REDIS_TTL, 10) || 3600 // 1 hour default TTL
  },

  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 50,
    maxLimit: 100
  },

  // Swagger documentation
  swagger: {
    title: process.env.SWAGGER_TITLE || 'HRMS Odoo Connector API',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    description: process.env.SWAGGER_DESCRIPTION || 'Enterprise-grade HRMS connector for Odoo',
    host: process.env.SWAGGER_HOST || `localhost:${process.env.PORT || 3000}`,
    basePath: process.env.API_PREFIX || '/api/v1'
  }
};

/**
 * Validate required configuration
 */
const validateConfig = () => {
  const required = [
    'ODOO_HOST',
    'ODOO_PORT',
    'ODOO_DATABASE',
    'ODOO_USERNAME',
    'ODOO_PASSWORD'
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }
};

// Validate configuration on load (except in test environment)
if (config.app.env !== 'test') {
  validateConfig();
}

module.exports = config;
