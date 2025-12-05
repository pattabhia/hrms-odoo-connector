const { ValidationError } = require('../core/errors');

/**
 * Validation Middleware
 * Validates request data using validators
 */

/**
 * Validate request body
 * @param {Object} validator - Validator instance
 * @returns {Function} Express middleware
 */
const validateBody = (validator) => {
  return (req, res, next) => {
    const validationResult = validator.validate(req.body);

    if (!validationResult.isValid) {
      return next(
        new ValidationError(
          validationResult.errors,
          validationResult.fields
        )
      );
    }

    // Replace req.body with validated and sanitized data
    if (validationResult.value) {
      req.body = validationResult.value;
    }

    next();
  };
};

/**
 * Validate request params
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return next(new ValidationError(errors));
    }

    req.params = value;
    next();
  };
};

/**
 * Validate request query
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return next(new ValidationError(errors));
    }

    req.query = value;
    next();
  };
};

/**
 * Validate ID parameter
 * Common validation for numeric IDs
 */
const validateId = (req, res, next) => {
  const { id } = req.params;
  const numericId = parseInt(id, 10);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return next(new ValidationError('Invalid ID: must be a positive integer'));
  }

  req.params.id = numericId;
  next();
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;

  if (!Number.isInteger(page) || page < 1) {
    return next(new ValidationError('Invalid page: must be a positive integer'));
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return next(new ValidationError('Invalid limit: must be between 1 and 100'));
  }

  req.query.page = page;
  req.query.limit = limit;
  next();
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  validateId,
  validatePagination
};
