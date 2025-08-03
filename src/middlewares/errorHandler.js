// src/middlewares/errorHandler.js
const { AppError } = require('../common/errors');

function errorHandler(err, req, res, next) {
  console.error('Global Error Handler:', err.message); // Log the error message for debugging

  let error = { ...err };
  error.message = err.message;

  // Handle our custom AppError instances (check both instanceof and statusCode)
  if (err instanceof AppError || (err.statusCode && err.statusCode >= 400 && err.statusCode < 600)) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Handle Prisma/Database errors
  if (err.code === 'P2002') {
    error.message = 'Duplicate field value entered';
    error.statusCode = 409;
  }

  // Handle Validation errors (Joi)
  if (err.name === 'ValidationError') {
    error.message = 'Invalid input data';
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Customize error response based on environment
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      error: message,
      stack: err.stack // Include stack trace in dev for debugging
    });
  } else {
    // In production, send appropriate error messages
    if (statusCode >= 400 && statusCode < 500) {
      // Client errors - send the actual message
      return res.status(statusCode).json({
        error: message
      });
    } else {
      // Server errors - send generic message
      return res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    }
  }
}

module.exports = errorHandler;