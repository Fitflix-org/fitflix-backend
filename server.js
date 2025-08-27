// Load environment variables first (only in development)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  console.log('📁 Loading .env file for development');
}

// Ensure NODE_ENV is set (fallback to production for safety)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
  console.log('⚠️ NODE_ENV not set, defaulting to production');
}

// Debug environment variables
console.log('🔍 Environment Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
  COOKIE_SECRET: process.env.COOKIE_SECRET ? 'SET' : 'NOT SET',
  NODE_VERSION: process.version,
  PLATFORM: process.platform,
  ARCH: process.arch
});

const app = require('./src/app');
const cluster = require('cluster');
const os = require('os');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Production clustering for better performance
if (NODE_ENV === 'production' && cluster.isMaster) {
  const numCPUs = os.cpus().length;
  
  console.log(`🚀 Master process ${process.pid} is running`);
  console.log(`📊 Spawning ${numCPUs} worker processes...`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
  
  cluster.on('online', (worker) => {
    console.log(`✅ Worker ${worker.process.pid} is online`);
  });
  
} else {
  // Worker process or development mode
  const server = app.listen(PORT, () => {
    const workerInfo = cluster.isWorker ? ` (Worker ${process.pid})` : '';
    console.log(`🚀 FitFlix Backend Server running on port ${PORT}${workerInfo}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    
    if (NODE_ENV === 'production') {
      console.log('🔒 Production mode enabled');
      console.log('📊 Rate limiting: Enabled');
      console.log('🗜️ Compression: Enabled');
      console.log('🛡️ Security headers: Enabled');
    }
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
  
  // Health check for load balancers
  server.on('connection', (socket) => {
    // Set keep-alive timeout
    socket.setTimeout(30000); // 30 seconds
  });
}
