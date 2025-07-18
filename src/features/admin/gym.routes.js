const express = require("express");
const router = express.Router();
const gymController = require("./gym.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

// Create a new gym
router.post("/", authenticate, gymController.createGym);

// Update a gym by ID
router.put("/:id", authenticate, gymController.updateGym);

// Get all gyms
router.get("/", authenticate, gymController.getAllGyms);

// Get a gym by I
router.get('/:id', authenticate, gymController.getGymById);

module.exports = router;
