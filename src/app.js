// src/app.js
// This file sets up the main Express application, applies global middlewares,
// and mounts the main API routes.

require('dotenv').config(); // Load environment variables at the very top
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Import routes
const { router: authRoutes } = require('./features/auth/auth.routes');
const blogRoutes = require('./features/blog/blog.routes');
const userRoutes = require('./features/user/user.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.ADMIN_DASHBOARD_URL || 'http://localhost:5173',
    process.env.WEBSITE_URL || 'http://localhost:8080'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Fitflix Blog API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;