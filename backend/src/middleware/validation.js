const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

/**
 * Middleware factory for request validation
 * @param {Object} schema - Joi schema object with body, query, params keys
 * @param {Object} options - Validation options
 */
const validate = (schema, options = {}) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false,
      stripUnknown: true,
      ...options,
    };

    const errors = [];

    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, validationOptions);
      if (error) {
        errors.push(...error.details.map((d) => ({ field: d.path.join('.'), message: d.message })));
      } else {
        req.body = value;
      }
    }

    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, validationOptions);
      if (error) {
        errors.push(
          ...error.details.map((d) => ({ field: `query.${d.path.join('.')}`, message: d.message }))
        );
      } else {
        req.query = value;
      }
    }

    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, validationOptions);
      if (error) {
        errors.push(
          ...error.details.map((d) => ({ field: `param.${d.path.join('.')}`, message: d.message }))
        );
      } else {
        req.params = value;
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', errors));
    }

    next();
  };
};

// Common schemas
const commonSchemas = {
  id: Joi.string().uuid().required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
  uuid: Joi.string().uuid(),
};

// Auth schemas
const authSchemas = {
  register: {
    body: Joi.object({
      firstName: Joi.string().min(2).max(50).trim().required(),
      lastName: Joi.string().min(2).max(50).trim().required(),
      email: Joi.string().email().lowercase().trim().required(),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .required()
        .messages({
          'string.pattern.base':
            'Password must contain at least one uppercase, lowercase, number, and special character',
        }),
      role: Joi.string().valid('user', 'admin').default('user'),
    }),
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().lowercase().trim().required(),
      password: Joi.string().required(),
    }),
  },
  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string().required(),
    }),
  },
  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .required(),
    }),
  },
};

// Resume schemas
const resumeSchemas = {
  analyze: {
    body: Joi.object({
      targetRole: Joi.string().max(100).optional(),
      targetIndustry: Joi.string().max(100).optional(),
    }),
  },
};

// Job matching schemas
const jobSchemas = {
  search: {
    query: Joi.object({
      keyword: Joi.string().max(200).optional(),
      location: Joi.string().max(100).optional(),
      experienceLevel: Joi.string().valid('entry', 'mid', 'senior', 'lead').optional(),
      jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'remote').optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(20),
    }),
  },
};

// Study plan schemas
const studyPlanSchemas = {
  create: {
    body: Joi.object({
      title: Joi.string().min(3).max(200).trim().required(),
      skillGaps: Joi.array().items(Joi.string()).min(1).required(),
      targetRole: Joi.string().max(100).required(),
      durationWeeks: Joi.number().integer().min(1).max(52).default(12),
    }),
  },
};

// Interview schemas
const interviewSchemas = {
  create: {
    body: Joi.object({
      jobRole: Joi.string().max(100).required(),
      experienceLevel: Joi.string().valid('entry', 'mid', 'senior', 'lead').required(),
      interviewType: Joi.string()
        .valid('technical', 'behavioral', 'system-design', 'mixed')
        .required(),
    }),
  },
  submitAnswer: {
    body: Joi.object({
      questionId: Joi.string().uuid().required(),
      answer: Joi.string().min(10).max(5000).required(),
    }),
  },
};

module.exports = {
  validate,
  commonSchemas,
  authSchemas,
  resumeSchemas,
  jobSchemas,
  studyPlanSchemas,
  interviewSchemas,
};
