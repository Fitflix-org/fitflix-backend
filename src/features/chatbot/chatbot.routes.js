const express = require('express');
const chatbotController = require('./chatbot.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/inputValidation');

const router = express.Router();

// All chatbot routes require authentication
router.use(authenticate);

// Send message to chatbot
router.post('/message', validate('chatbotMessage'), chatbotController.sendMessage);

// Get conversation context/history
router.get('/context', chatbotController.getContext);

// Clear conversation history
router.delete('/history', chatbotController.clearHistory);

module.exports = router;
