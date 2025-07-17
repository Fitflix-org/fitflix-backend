// index.js
// This is the main entry point for the Fitflix backend application.
// It imports the Express app and starts the server.

const app = require('./src/app'); // Import the Express app from src/app.js

const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Access API at http://localhost:${PORT}/api`);
});