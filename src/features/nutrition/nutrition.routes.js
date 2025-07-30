const express = require('express');
const router = express.Router();
const nutritionController = require('./nutrition.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/inputValidation');

/**
 * @swagger
 * tags:
 *   name: Nutrition
 *   description: Nutrition tracking and meal logging
 */

// Log nutrition
router.post('/log', authenticate, validate('logNutrition'), nutritionController.logNutrition);

// Get daily nutrition
router.get('/daily', authenticate, nutritionController.getDailyNutrition);

// Update nutrition log
router.put('/logs/:id', authenticate, nutritionController.updateNutritionLog);

// Delete nutrition log
router.delete('/logs/:id', authenticate, nutritionController.deleteNutritionLog);

module.exports = router;
