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

// Additional HR modules
const AttendanceRepository = require('./modules/attendance/attendance.repository');
const AttendanceService = require('./modules/attendance/attendance.service');
const AttendanceController = require('./modules/attendance/attendance.controller');
const AttendanceAdapter = require('./modules/attendance/attendance.adapter');
const createAttendanceRoutes = require('./modules/attendance/attendance.routes');

const TimeOffRepository = require('./modules/timeoff/timeoff.repository');
const TimeOffService = require('./modules/timeoff/timeoff.service');
const TimeOffController = require('./modules/timeoff/timeoff.controller');
const TimeOffAdapter = require('./modules/timeoff/timeoff.adapter');
const createTimeOffRoutes = require('./modules/timeoff/timeoff.routes');

const PayrollRepository = require('./modules/payroll/payroll.repository');
const PayrollService = require('./modules/payroll/payroll.service');
const PayrollController = require('./modules/payroll/payroll.controller');
const PayrollAdapter = require('./modules/payroll/payroll.adapter');
const createPayrollRoutes = require('./modules/payroll/payroll.routes');

const ExpensesRepository = require('./modules/expenses/expenses.repository');
const ExpensesService = require('./modules/expenses/expenses.service');
const ExpensesController = require('./modules/expenses/expenses.controller');
const ExpensesAdapter = require('./modules/expenses/expenses.adapter');
const createExpensesRoutes = require('./modules/expenses/expenses.routes');

const InvoicesRepository = require('./modules/invoices/invoices.repository');
const InvoicesService = require('./modules/invoices/invoices.service');
const InvoicesController = require('./modules/invoices/invoices.controller');
const InvoicesAdapter = require('./modules/invoices/invoices.adapter');
const createInvoicesRoutes = require('./modules/invoices/invoices.routes');

const RecruitmentRepository = require('./modules/recruitment/recruitment.repository');
const RecruitmentService = require('./modules/recruitment/recruitment.service');
const RecruitmentController = require('./modules/recruitment/recruitment.controller');
const RecruitmentAdapter = require('./modules/recruitment/recruitment.adapter');
const createRecruitmentRoutes = require('./modules/recruitment/recruitment.routes');

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

  // Attendance Module
  const attendanceRepository = new AttendanceRepository(
    odooPool,
    config.odoo.models.attendance,
    logger
  );
  const attendanceService = new AttendanceService(attendanceRepository, {
    adapter: new AttendanceAdapter(),
    logger,
    defaultFields: config.odoo.defaultFields.attendance
  });
  const attendanceController = new AttendanceController(attendanceService, logger);

  // Time Off Module
  const timeOffRepository = new TimeOffRepository(odooPool, config.odoo.models.leave, logger);
  const timeOffService = new TimeOffService(timeOffRepository, {
    adapter: new TimeOffAdapter(),
    logger,
    defaultFields: config.odoo.defaultFields.leave
  });
  const timeOffController = new TimeOffController(timeOffService, logger);

  // Payroll Module
  const payrollRepository = new PayrollRepository(odooPool, config.odoo.models.payslip, logger);
  const payrollService = new PayrollService(payrollRepository, {
    adapter: new PayrollAdapter(),
    logger,
    defaultFields: config.odoo.defaultFields.payslip
  });
  const payrollController = new PayrollController(payrollService, logger);

  // Expenses Module
  const expensesRepository = new ExpensesRepository(odooPool, config.odoo.models.expense, logger);
  const expensesService = new ExpensesService(expensesRepository, {
    adapter: new ExpensesAdapter(),
    logger,
    defaultFields: config.odoo.defaultFields.expense
  });
  const expensesController = new ExpensesController(expensesService, logger);

  // Invoices Module
  const invoicesRepository = new InvoicesRepository(odooPool, config.odoo.models.invoice, logger);
  const invoicesService = new InvoicesService(invoicesRepository, {
    adapter: new InvoicesAdapter(),
    logger,
    defaultFields: config.odoo.defaultFields.invoice
  });
  const invoicesController = new InvoicesController(invoicesService, logger);

  // Recruitment Module
  const recruitmentRepository = new RecruitmentRepository(
    odooPool,
    config.odoo.models.applicant,
    logger
  );
  const recruitmentService = new RecruitmentService(recruitmentRepository, {
    adapter: new RecruitmentAdapter(),
    logger,
    defaultFields: config.odoo.defaultFields.applicant
  });
  const recruitmentController = new RecruitmentController(recruitmentService, logger);

  // ============================================================================
  // ROUTES
  // ============================================================================

  const API_PREFIX = config.app.apiPrefix;

  // Employee routes
  app.use(`${API_PREFIX}/employees`, createEmployeeRoutes(employeeController));

  app.use(`${API_PREFIX}/attendance`, createAttendanceRoutes(attendanceController));
  app.use(`${API_PREFIX}/timeoff`, createTimeOffRoutes(timeOffController));
  app.use(`${API_PREFIX}/payroll`, createPayrollRoutes(payrollController));
  app.use(`${API_PREFIX}/expenses`, createExpensesRoutes(expensesController));
  app.use(`${API_PREFIX}/invoices`, createInvoicesRoutes(invoicesController));
  app.use(`${API_PREFIX}/recruitment`, createRecruitmentRoutes(recruitmentController));

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
