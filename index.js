// index.js
// This is the main entry point for the Fitflix backend application.
// It imports the Express app and starts the server.

const app = require('./src/app'); // Import the Express app from src/app.js
const blogScheduler = require('./src/features/blog/blog.scheduler'); // Import the blog scheduler

const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Access API at http://localhost:${PORT}/api`);
  
  // Start the blog scheduler automatically
  console.log('🚀 Starting blog scheduler...');
  blogScheduler.start();
  
  // Log scheduler status
  setTimeout(async () => {
    try {
      const status = await blogScheduler.getStatus();
      console.log('📅 Blog Scheduler Status:', status);
    } catch (error) {
      console.error('❌ Error getting scheduler status:', error);
    }
  }, 2000);
});