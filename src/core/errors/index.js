/**
 * Central export for all error classes
 * Makes importing errors easier throughout the application
 */

const AppError = require('./AppError');
const ValidationError = require('./ValidationError');
const OdooConnectionError = require('./OdooConnectionError');
const NotFoundError = require('./NotFoundError');
const RepositoryError = require('./RepositoryError');
const ServiceError = require('./ServiceError');

module.exports = {
  AppError,
  ValidationError,
  OdooConnectionError,
  NotFoundError,
  RepositoryError,
  ServiceError
};
