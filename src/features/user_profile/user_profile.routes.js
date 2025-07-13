// src/features/user_profile/user_profile.routes.js
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: API for managing user profiles
 */
const userProfileController = require('./user_profile.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * /user-profile:
 *   get:
 *     summary: Get user profile
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User profile not found
 *       500:
 *         description: Internal server error
 */
router.get('/',authenticate, userProfileController.getUserProfile);
/**
 * @swagger
 * /user-profile:
 *   post:
 *     summary: Create or update user profile
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileInput'
 *     responses:
 *       200:
 *         description: User profile created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, userProfileController.createOrUpdateUserProfile);
/**
 * @swagger
 * /user-profile:
 *   put:
 *     summary: Create or update user profile (alias for POST)
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileInput'
 *     responses:
 *       200:
 *         description: User profile created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/', authenticate, userProfileController.createOrUpdateUserProfile);

module.exports = router;