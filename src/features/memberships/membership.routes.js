const express = require('express');
const router = express.Router();
const membershipController = require('./membership.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Memberships
 *   description: Membership plan management
 */

// Get all membership plans (public)
router.get('/', membershipController.getAllMembershipPlans);

module.exports = router;
