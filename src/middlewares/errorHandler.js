// src/middlewares/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('Global Error Handler:', err); // Log the full error for debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Customize error response based on environment or error type
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      message: message,
      stack: err.stack // Include stack trace in dev for debugging
    });
  } else {
    // In production, send a generic error message
    return res.status(statusCode).json({
      message: 'An unexpected error occurred.'
    });
  }
}

module.exports = errorHandler;