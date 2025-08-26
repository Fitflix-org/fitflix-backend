// src/index.js
// This file aggregates all feature-specific routes and mounts them.

const express = require('express');
const router = express.Router();

// Import feature routes
const blogRoutes = require('./features/blog/blog.routes');
// Blog routes (e.g., /api/blogs)
router.use('/blogs', blogRoutes);

module.exports = router;