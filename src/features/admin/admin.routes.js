const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API for administrative tasks
 */
const adminController = require('./admin.controller');
const gymRoutes = require('./gym.routes');

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if not admin)
 *       500:
 *         description: Internal server error
 */
router.get('/users',  adminController.getAllUsers);

// Mount gym routes under /admin/gyms
router.use('/gyms', gymRoutes);

module.exports = router;