// Environment variables are loaded via package.json scripts
// Production: uses .env via dotenv_config_path=.env
// Development: uses .env.dev via dotenv_config_path=.env.dev
console.log('📁 Environment loaded via script configuration');

// Ensure NODE_ENV is set (fallback to production for safety)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
  console.log('⚠️ NODE_ENV not set, defaulting to production');
}

// Debug environment variables (disabled in production by default)
if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGS === 'true') {
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
}

const app = require('./src/app');
const blogScheduler = require('./src/features/blog/blog.scheduler');
const cluster = require('cluster');
const os = require('os');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Memory-optimized mode: Disable clustering for low-RAM environments
const ENABLE_CLUSTERING = process.env.ENABLE_CLUSTERING === 'true' && NODE_ENV === 'production';
const MAX_MEMORY_MB = parseInt(process.env.MAX_MEMORY_MB || '512');

// Disable clustering if memory is limited (< 1GB)
if (ENABLE_CLUSTERING && MAX_MEMORY_MB >= 1024 && cluster.isMaster) {
  const numCPUs = Math.min(os.cpus().length, Math.floor(MAX_MEMORY_MB / 256)); // 256MB per worker
  
  console.log(`🚀 Master process ${process.pid} is running`);
  console.log(`📊 Memory limit: ${MAX_MEMORY_MB}MB - Spawning ${numCPUs} worker processes...`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
  
  cluster.on('online', (worker) => {
    console.log(`✅ Worker ${worker.process.pid} is online`);
  });
  
} else {
  // Single process mode for low-memory environments or development
  const server = app.listen(PORT, () => {
    const workerInfo = cluster.isWorker ? ` (Worker ${process.pid})` : '';
    const memoryUsage = process.memoryUsage();
    const memoryMB = Math.round(memoryUsage.rss / 1024 / 1024);
    
    console.log(`🚀 FitFlix Backend Server running on port ${PORT}${workerInfo}`);
    console.log(`💾 Memory usage: ${memoryMB}MB RSS (Limit: ${MAX_MEMORY_MB}MB)`);
    console.log(`🔧 Clustering: ${ENABLE_CLUSTERING ? 'Enabled' : 'Disabled (Memory Optimized)'}`);
    
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGS === 'true') {
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
    }
    
    // Start the blog scheduler automatically
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGS === 'true') {
      console.log('🚀 Starting blog scheduler...');
    }
    blogScheduler.start();
    
    // Log scheduler status after a delay
    setTimeout(async () => {
      try {
        if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGS === 'true') {
          const status = await blogScheduler.getStatus();
          console.log('📅 Blog Scheduler Status:', status);
        }
      } catch (error) {
        console.error('❌ Error getting scheduler status:', error);
      }
    }, 2000);
    
    if (NODE_ENV === 'production') {
      if (process.env.DEBUG_LOGS === 'true') {
        console.log('🔒 Production mode enabled');
        console.log('📊 Rate limiting: Enabled');
        console.log('🗜️ Compression: Enabled');
        console.log('🛡️ Security headers: Enabled');
      }
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
