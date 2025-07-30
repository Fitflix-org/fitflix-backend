// src/features/auth/auth.routes.js
// This file defines the API routes for authentication.
// It imports the auth.controller and applies necessary middlewares.

const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */
const authController = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/inputValidation');
const { authLimiter, passwordResetLimiter } = require('../../middlewares/rateLimiter');

// Public routes for authentication
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=jwt_token_here; HttpOnly; Secure; SameSite=Strict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', authLimiter, validate('login'), authController.login);
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=jwt_token_here; HttpOnly; Secure; SameSite=Strict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User with email/username already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', authLimiter, validate('register'), authController.register);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful.
 *       500:
 *         description: Internal server error
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 description: New password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input or current password incorrect
 *       401:
 *         description: Unauthorized
 */
router.post('/change-password', authenticate, validate('changePassword'), authController.changePassword);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Initiate forgot password process
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *     responses:
 *       200:
 *         description: Password reset instructions sent
 */
router.post('/forgot-password', passwordResetLimiter, validate('forgotPassword'), authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using reset token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *               newPassword:
 *                 type: string
 *                 description: New password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', passwordResetLimiter, validate('resetPassword'), authController.resetPassword);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', validate('refreshToken'), authController.refreshToken);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
