/**
 * Application Constants
 * Centralized constants for the application
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

// Error Types
const ERROR_TYPES = {
  VALIDATION_ERROR: 'ValidationError',
  NOT_FOUND_ERROR: 'NotFoundError',
  AUTHENTICATION_ERROR: 'AuthenticationError',
  AUTHORIZATION_ERROR: 'AuthorizationError',
  ODOO_CONNECTION_ERROR: 'OdooConnectionError',
  REPOSITORY_ERROR: 'RepositoryError',
  SERVICE_ERROR: 'ServiceError'
};

// Odoo Models
const ODOO_MODELS = {
  EMPLOYEE: 'hr.employee',
  ATTENDANCE: 'hr.attendance',
  LEAVE: 'hr.leave',
  DEPARTMENT: 'hr.department',
  JOB: 'hr.job',
  CONTRACT: 'hr.contract',
  PAYSLIP: 'hr.payslip'
};

// Cache Keys
const CACHE_KEYS = {
  EMPLOYEE: 'employee',
  EMPLOYEES_LIST: 'employees:list',
  EMPLOYEE_BY_ID: 'employee:id',
  EMPLOYEE_BY_EMAIL: 'employee:email',
  DEPARTMENT: 'department',
  JOB: 'job'
};

// Cache TTL (in seconds)
const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100
};

// Date Formats
const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY: 'DD/MM/YYYY'
};

// API Versions
const API_VERSIONS = {
  V1: '/api/v1'
};

module.exports = {
  HTTP_STATUS,
  ERROR_TYPES,
  ODOO_MODELS,
  CACHE_KEYS,
  CACHE_TTL,
  PAGINATION,
  DATE_FORMATS,
  API_VERSIONS
};
