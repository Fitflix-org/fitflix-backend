const express = require("express");
const router = express.Router();
const gymController = require("./gym.controller");

/**
 * @swagger
 * tags:
 *   name: Gyms
 *   description: Public gym endpoints
 */

// Get all gyms (public)
router.get("/", gymController.getAllGyms);

// Get a gym by ID (public)
router.get('/:id', gymController.getGymById);

module.exports = router;
