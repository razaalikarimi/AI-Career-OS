const logger = require('../utils/logger');

/**
 * Base application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

class ServiceUnavailableError extends AppError {
  constructor(service = 'Service') {
    super(`${service} is temporarily unavailable`, 503, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * Centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Normalize error
  let error = err;

  // Handle MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    error = new ConflictError('A record with this data already exists');
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error = new ValidationError('Referenced resource does not exist');
  } else if (err.code === 'ECONNREFUSED') {
    error = new ServiceUnavailableError('Database');
  } else if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid authentication token');
  } else if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Authentication token expired');
  } else if (err.name === 'ValidationError' && !err.isOperational) {
    // Joi validation error
    error = new ValidationError(err.message, err.details);
  }

  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  // Log error with appropriate severity
  if (statusCode >= 500) {
    logger.error({
      message: error.message,
      stack: error.stack,
      statusCode,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id,
      requestId: req.requestId,
    });
  } else {
    logger.warn({
      message: error.message,
      statusCode,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id,
    });
  }

  // Send error response
  const response = {
    success: false,
    error: {
      code: error.errorCode || 'INTERNAL_ERROR',
      message: isOperational ? error.message : 'An unexpected error occurred',
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      ...(error.details && { details: error.details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    },
  };

  res.status(statusCode).json(response);
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  errorHandler,
  notFoundHandler,
};
