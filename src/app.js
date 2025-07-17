// src/app.js
// This file sets up the main Express application, applies global middlewares,
// and mounts the main API routes.

require('dotenv').config(); // Load environment variables at the very top
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Assuming you need CORS for frontend interaction

// Import the main API router that aggregates all feature routes
const apiRoutes = require('./index');


// Import global middlewares
const { authenticate } = require('./middlewares/auth.middleware'); // Your JWT verify middleware
const errorHandler = require('./middlewares/errorHandler'); // Centralized error handler (you'll create/update this)
// const validationMiddleware = require('./middlewares/validation.middleware'); // If you implement a global validation middleware

const app = express();

// ---------------------------------------------------
// Global Middlewares
// ---------------------------------------------------

// Enable CORS for all origins (adjust as needed for production security)
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Parse cookies from incoming requests
app.use(cookieParser());

// ---------------------------------------------------
// API Routes
// ---------------------------------------------------

// Mount the main API router under a '/api' prefix (common practice)
app.use('/api', apiRoutes);


// ---------------------------------------------------
// Error Handling Middleware
// ---------------------------------------------------
// This should be the last middleware added.
// It catches any errors thrown by previous middlewares or route handlers.
app.use(errorHandler);

// ---------------------------------------------------
// Default Route for unmatched requests (404)
// ---------------------------------------------------
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});


module.exports = app;