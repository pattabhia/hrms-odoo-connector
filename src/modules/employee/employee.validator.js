const Joi = require('joi');

/**
 * Employee Validator
 * Uses Joi for robust input validation
 * Validates employee data before processing
 */
class EmployeeValidator {
  constructor() {
    // Schema for creating an employee
    this.createSchema = Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name must not exceed 100 characters',
        'any.required': 'Name is required'
      }),

      email: Joi.string().email().allow('').optional().messages({
        'string.email': 'Invalid email format'
      }),

      phone: Joi.string()
        .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .allow('')
        .optional()
        .messages({
          'string.pattern.base': 'Invalid phone number format'
        }),

      mobile: Joi.string()
        .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .allow('')
        .optional()
        .messages({
          'string.pattern.base': 'Invalid mobile number format'
        }),

      jobId: Joi.number().integer().positive().optional().messages({
        'number.base': 'Job ID must be a number',
        'number.integer': 'Job ID must be an integer',
        'number.positive': 'Job ID must be a positive number'
      }),

      departmentId: Joi.number().integer().positive().optional().messages({
        'number.base': 'Department ID must be a number',
        'number.integer': 'Department ID must be an integer',
        'number.positive': 'Department ID must be a positive number'
      }),

      managerId: Joi.number().integer().positive().optional().messages({
        'number.base': 'Manager ID must be a number',
        'number.integer': 'Manager ID must be an integer',
        'number.positive': 'Manager ID must be a positive number'
      }),

      workLocation: Joi.string().max(200).allow('').optional().messages({
        'string.max': 'Work location must not exceed 200 characters'
      }),

      joinDate: Joi.date().iso().optional().messages({
        'date.format': 'Join date must be in ISO 8601 format (YYYY-MM-DD)'
      }),

      active: Joi.boolean().optional().default(true)
    });

    // Schema for updating an employee (all fields optional except constraints)
    this.updateSchema = Joi.object({
      name: Joi.string().min(2).max(100).optional().messages({
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name must not exceed 100 characters'
      }),

      email: Joi.string().email().allow('').optional().messages({
        'string.email': 'Invalid email format'
      }),

      phone: Joi.string()
        .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .allow('')
        .optional()
        .messages({
          'string.pattern.base': 'Invalid phone number format'
        }),

      mobile: Joi.string()
        .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .allow('')
        .optional()
        .messages({
          'string.pattern.base': 'Invalid mobile number format'
        }),

      jobId: Joi.number().integer().positive().optional().allow(null).messages({
        'number.base': 'Job ID must be a number',
        'number.integer': 'Job ID must be an integer',
        'number.positive': 'Job ID must be a positive number'
      }),

      departmentId: Joi.number().integer().positive().optional().allow(null).messages({
        'number.base': 'Department ID must be a number',
        'number.integer': 'Department ID must be an integer',
        'number.positive': 'Department ID must be a positive number'
      }),

      managerId: Joi.number().integer().positive().optional().allow(null).messages({
        'number.base': 'Manager ID must be a number',
        'number.integer': 'Manager ID must be an integer',
        'number.positive': 'Manager ID must be a positive number'
      }),

      workLocation: Joi.string().max(200).allow('').optional().messages({
        'string.max': 'Work location must not exceed 200 characters'
      }),

      joinDate: Joi.date().iso().optional().allow(null).messages({
        'date.format': 'Join date must be in ISO 8601 format (YYYY-MM-DD)'
      }),

      active: Joi.boolean().optional()
    }).min(1).messages({
      'object.min': 'At least one field must be provided for update'
    });
  }

  /**
   * Validate employee data for creation
   * @param {Object} data - Employee data to validate
   * @returns {Object} Validation result
   */
  validate(data) {
    const { error, value } = this.createSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return {
        isValid: false,
        errors: error.details.map((detail) => detail.message),
        fields: error.details.reduce((acc, detail) => {
          acc[detail.path[0]] = detail.message;
          return acc;
        }, {})
      };
    }

    return {
      isValid: true,
      value
    };
  }

  /**
   * Validate employee data for update
   * @param {Object} data - Employee data to validate
   * @returns {Object} Validation result
   */
  validateUpdate(data) {
    const { error, value } = this.updateSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return {
        isValid: false,
        errors: error.details.map((detail) => detail.message),
        fields: error.details.reduce((acc, detail) => {
          acc[detail.path[0]] = detail.message;
          return acc;
        }, {})
      };
    }

    return {
      isValid: true,
      value
    };
  }

  /**
   * Validate query parameters
   * @param {Object} query - Query parameters
   * @returns {Object} Validation result
   */
  validateQuery(query) {
    const querySchema = Joi.object({
      page: Joi.number().integer().min(1).optional().default(1),
      limit: Joi.number().integer().min(1).max(100).optional().default(50),
      departmentId: Joi.number().integer().positive().optional(),
      jobId: Joi.number().integer().positive().optional(),
      managerId: Joi.number().integer().positive().optional(),
      active: Joi.boolean().optional(),
      search: Joi.string().max(100).optional()
    });

    const { error, value } = querySchema.validate(query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return {
        isValid: false,
        errors: error.details.map((detail) => detail.message)
      };
    }

    return {
      isValid: true,
      value
    };
  }
}

module.exports = EmployeeValidator;
