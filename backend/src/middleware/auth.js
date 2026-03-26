const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * JWT Authentication middleware
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted (logged out)
    const isBlacklisted = await cache.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AuthenticationError('Token has been invalidated');
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId,
    };

    req.token = token;
    next();
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new AuthenticationError(error.message));
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
    req.token = token;
  } catch {
    // Silent failure for optional auth
  }
  next();
};

/**
 * Role-based access control middleware factory
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn({
        message: 'Unauthorized access attempt',
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      return next(
        new AuthorizationError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

/**
 * Resource ownership verification middleware
 */
const verifyOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      const resourceUserId = await getResourceUserId(req);
      if (resourceUserId !== req.user.id && req.user.role !== 'admin') {
        throw new AuthorizationError('You do not own this resource');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authenticate, optionalAuthenticate, authorize, verifyOwnership };
