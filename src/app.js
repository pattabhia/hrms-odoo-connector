const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const config = require('./config');
const { createLogger } = require('./infrastructure/logging/Logger');
const { morganLogger, requestId } = require('./middleware/logging.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

// Import infrastructure
const { OdooConnectionPool } = require('./infrastructure/odoo');
const { RedisCache } = require('./infrastructure/cache/RedisCache');
const { CacheManager } = require('./infrastructure/cache/CacheManager');

// Import Employee module
const EmployeeRepository = require('./modules/employee/employee.repository');
const EmployeeService = require('./modules/employee/employee.service');
const EmployeeController = require('./modules/employee/employee.controller');
const EmployeeValidator = require('./modules/employee/employee.validator');
const EmployeeAdapter = require('./modules/employee/employee.adapter');
const createEmployeeRoutes = require('./modules/employee/employee.routes');

const logger = createLogger('Application');

/**
 * Create and configure Express application
 */
function createApp() {
  const app = express();

  // ============================================================================
  // MIDDLEWARE SETUP
  // ============================================================================

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // CORS - must be before other middleware
  app.use(
    cors({
      origin: config.cors.origin === '*' ? '*' : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        config.cors.origin
      ].filter(Boolean),
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request ID
  app.use(requestId);

  // HTTP logging
  app.use(morganLogger);

  // Rate limiting
  app.use(apiLimiter);

  // ============================================================================
  // SWAGGER DOCUMENTATION
  // ============================================================================

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: config.swagger.title,
        version: config.swagger.version,
        description: config.swagger.description,
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        }
      },
      servers: [
        {
          url: `http://localhost:${config.app.port}${config.app.apiPrefix}`,
          description: 'Development server'
        },
        {
          url: `http://127.0.0.1:${config.app.port}${config.app.apiPrefix}`,
          description: 'Development server (127.0.0.1)'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    },
    apis: ['./src/modules/**/*.routes.js'] // Path to route files
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'HRMS Odoo Connector API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.app.env
    });
  });

  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Welcome to HRMS Odoo Connector API',
      version: '1.0.0',
      documentation: '/api-docs',
      health: '/health'
    });
  });

  // ============================================================================
  // DEPENDENCY INJECTION & MODULE SETUP
  // ============================================================================

  // Initialize Odoo Connection Pool
  const odooPool = OdooConnectionPool.getInstance(config.odoo, logger);

  // Initialize Cache (optional - gracefully handle if Redis is unavailable)
  let cacheManager = null;
  try {
    const redisCache = new RedisCache(config.redis, logger);
    cacheManager = new CacheManager(redisCache, logger);

    // Connect to Redis (non-blocking)
    redisCache.connect().catch((err) => {
      logger.warn('Redis connection failed, cache disabled', err);
    });
  } catch (error) {
    logger.warn('Cache initialization failed, running without cache', error);
  }

  // Employee Module Dependencies
  const employeeRepository = new EmployeeRepository(
    odooPool,
    config.odoo.models.employee,
    logger
  );
  const employeeValidator = new EmployeeValidator();
  const employeeAdapter = new EmployeeAdapter();
  const employeeService = new EmployeeService(
    employeeRepository,
    employeeValidator,
    employeeAdapter,
    logger
  );
  const employeeController = new EmployeeController(employeeService, logger);

  // ============================================================================
  // ROUTES
  // ============================================================================

  const API_PREFIX = config.app.apiPrefix;

  // Employee routes
  app.use(`${API_PREFIX}/employees`, createEmployeeRoutes(employeeController));

  // Add more module routes here as you build them
  // app.use(`${API_PREFIX}/attendance`, createAttendanceRoutes(attendanceController));
  // app.use(`${API_PREFIX}/leaves`, createLeaveRoutes(leaveController));

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  // ============================================================================
  // GRACEFUL SHUTDOWN
  // ============================================================================

  const gracefulShutdown = async () => {
    logger.info('Received shutdown signal, closing gracefully...');

    try {
      // Close Odoo connections
      if (odooPool) {
        await odooPool.destroy();
        logger.info('Odoo connections closed');
      }

      // Close Redis connection
      if (cacheManager && cacheManager.cache) {
        await cacheManager.cache.disconnect();
        logger.info('Redis connection closed');
      }

      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  return app;
}

module.exports = createApp;
