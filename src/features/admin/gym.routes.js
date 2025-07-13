const express = require("express");
const router = express.Router();
const gymController = require("./gym.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

// Create a new gym
router.post("/", gymController.createGym);

// Update a gym by ID
router.put("/:id", gymController.updateGym);

// Get all gyms
router.get("/", gymController.getAllGyms);

// Get a gym by ID
router.get('/:id', gymController.getGymById);

module.exports = router;
