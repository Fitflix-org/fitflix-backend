const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/inputValidation');
const { paymentLimiter } = require('../../middlewares/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing with Razorpay
 */

// Initialize payment order
router.post('/initialize', authenticate, paymentLimiter, validate('createPayment'), paymentController.initializePayment);

// Verify payment
router.post('/verify', authenticate, paymentLimiter, validate('verifyPayment'), paymentController.verifyPayment);

// Webhook endpoint (no authentication required)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
