// src/app.js
// This file sets up the main Express application, applies global middlewares,
// and mounts the main API routes.

require('dotenv').config(); // Load environment variables at the very top
const express = require('express');
const cookieParser = require('cookie-parser');

// Import the main API router that aggregates all feature routes
const apiRoutes = require('./index');

// Import global middlewares
const { authenticate } = require('./middlewares/auth.middleware');
const errorHandler = require('./middlewares/errorHandler');
const { configureSecurity, requestLimits, requestLogger, secureErrorHandler } = require('./middlewares/security');

const app = express();

// ---------------------------------------------------
// Security Configuration
// ---------------------------------------------------

// Configure security headers and CORS
configureSecurity(app);

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Request logging (in development)
if (process.env.NODE_ENV === 'development') {
    app.use(requestLogger);
}

// ---------------------------------------------------
// Global Middlewares
// ---------------------------------------------------

// Parse JSON request bodies with size limit
app.use(express.json({ limit: requestLimits.json }));

// Parse URL-encoded request bodies with size limit
app.use(express.urlencoded({ 
    extended: true, 
    limit: requestLimits.urlencoded 
}));

// Parse cookies from incoming requests
app.use(cookieParser());

// ---------------------------------------------------
// API Routes
// ---------------------------------------------------

// Mount the main API router under a '/api' prefix
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ---------------------------------------------------
// Error Handling Middleware
// ---------------------------------------------------

// Security error handler (should come before general error handler)
app.use(secureErrorHandler);

// General error handler (should be the last middleware)
app.use(errorHandler);

// ---------------------------------------------------
// Default Route for unmatched requests (404)
// ---------------------------------------------------
app.use((req, res, next) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: 'The requested resource was not found on this server.'
    });
});


module.exports = app;