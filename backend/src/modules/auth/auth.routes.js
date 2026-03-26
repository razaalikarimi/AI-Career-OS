const { Router } = require('express');
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');
const { validate, authSchemas } = require('../../middleware/validation');
const { authRateLimiter } = require('../../middleware/security');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & authorization endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: User created successfully
 *       422:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post('/register', authRateLimiter, validate(authSchemas.register), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get tokens
 *     tags: [Auth]
 */
router.post('/login', authRateLimiter, validate(authSchemas.login), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 */
router.post('/refresh', validate(authSchemas.refreshToken), authController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and invalidate tokens
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/change-password',
  authenticate,
  validate(authSchemas.changePassword),
  authController.changePassword
);

module.exports = router;
