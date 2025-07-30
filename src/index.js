// src/index.js
// This file aggregates all feature-specific routes and mounts them.

const express = require('express');
const router = express.Router();

// Import feature routes
const authRoutes = require('./features/auth/auth.routes');
const adminRoutes = require('./features/admin/admin.routes');
const userProfileRoutes = require('./features/user_profile/user_profile.routes');
const gymRoutes = require('./features/gyms/gym.routes');
const membershipRoutes = require('./features/memberships/membership.routes');
const paymentRoutes = require('./features/payments/payment.routes');
const nutritionRoutes = require('./features/nutrition/nutrition.routes');
const chatbotRoutes = require('./features/chatbot/chatbot.routes');

// Import middleware
const { generalLimiter } = require('./middlewares/rateLimiter');
const { sanitizeInput } = require('./middlewares/inputValidation');

// ---------------------------------------------------
// Apply Global Middleware
// ---------------------------------------------------

// Apply rate limiting to all routes
router.use(generalLimiter);

// Apply input sanitization to all routes
router.use(sanitizeInput);

// ---------------------------------------------------
// Mount Feature Routes
// ---------------------------------------------------

// Auth routes (e.g., /api/auth/login, /api/auth/register)
router.use('/auth', authRoutes);

// Admin routes (e.g., /api/admin/gyms)
router.use('/admin', adminRoutes);

// User profile routes (e.g., /api/user-profile)
router.use('/user-profile', userProfileRoutes);

// Public gym routes (e.g., /api/gyms)
router.use('/gyms', gymRoutes);

// Membership routes (e.g., /api/memberships)
router.use('/memberships', membershipRoutes);

// Payment routes (e.g., /api/payments)
router.use('/payments', paymentRoutes);

// Nutrition routes (e.g., /api/nutrition)
router.use('/nutrition', nutritionRoutes);

// Chatbot routes (e.g., /api/chatbot)
router.use('/chatbot', chatbotRoutes);

module.exports = router;