// src/index.js
// This file aggregates all feature-specific routes and mounts them.

const express = require('express');
const router = express.Router();

// Import feature routes
const authRoutes = require('./features/auth/auth.routes');
// const userRoutes = require('../features/users/user.routes'); // Will be refactored later
const adminRoutes = require('./features/admin/admin.routes');
const userProfileRoutes = require('./features/user_profile/user_profile.routes');
// const frontdeskRoutes = require('./frontdesk/index'); // Assuming frontdesk routes are aggregated in frontdesk/index.js

// ---------------------------------------------------
// Mount Feature Routes
// ---------------------------------------------------

// Auth routes (e.g., /api/auth/login, /api/auth/register)
router.use('/auth', authRoutes);

// User routes (e.g., /api/users/profile) - will be refactored into src/features/users
// router.use('/users', userRoutes);

// Admin routes (e.g., /api/admin/gyms)
router.use('/admin', adminRoutes);

// Frontdesk routes (e.g., /api/frontdesk/checkins)
// router.use('/frontdesk', frontdeskRoutes);

// Add more feature routes here as you refactor them...
router.use('/user-profile', userProfileRoutes);

module.exports = router;