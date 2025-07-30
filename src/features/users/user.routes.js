const express = require('express');
const router = express.Router();
const membershipController = require('../memberships/membership.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: User Memberships
 *   description: User membership management
 */

// Get user's memberships
router.get('/memberships', authenticate, membershipController.getUserMemberships);

// Create new membership subscription
router.post('/memberships', authenticate, membershipController.createUserMembership);

// Update membership (cancel/renew)
router.put('/memberships/:id', authenticate, membershipController.updateUserMembership);

module.exports = router;
