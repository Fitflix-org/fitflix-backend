// Memory optimization configuration for low-RAM environments
const memoryOptimization = {
  // Reduce Express.js memory footprint
  express: {
    // Limit request size to prevent memory spikes
    jsonLimit: '1mb',
    urlencodedLimit: '1mb',
    
    // Optimize view engine (if using)
    viewCache: process.env.NODE_ENV === 'production',
    
    // Reduce middleware overhead
    etag: false, // Disable ETag generation to save CPU/memory
    
    // Connection settings
    keepAliveTimeout: 5000, // 5 seconds
    headersTimeout: 6000,   // 6 seconds
  },
  
  // HTTP compression settings
  compression: {
    level: 6, // Balance between compression and CPU usage
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      // Don't compress images and already compressed files
      const contentType = res.getHeader('content-type');
      if (contentType && (
        contentType.includes('image/') ||
        contentType.includes('video/') ||
        contentType.includes('application/zip') ||
        contentType.includes('application/gzip')
      )) {
        return false;
      }
      return true;
    },
  },
  
  // CORS optimization
  cors: {
    // Pre-calculated origins to avoid repeated parsing
    origin: process.env.CORS_ORIGINS ? 
      process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : 
      ['http://localhost:5173', 'https://fitflix.in', 'https://blogs.fitflix.in'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400, // Cache preflight for 24 hours
  },
  
  // Rate limiting with memory optimization
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    // Use memory store but with limits
    store: undefined, // Use default memory store with cleanup
    keyGenerator: (req) => {
      // Simple key generation to save memory
      return req.ip;
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      });
    },
  },
  
  // Logging optimization
  logging: {
    // Minimal logging in production to save memory
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    skip: (req, res) => {
      // Skip logging for health checks and static assets
      return req.url === '/health' || 
             req.url === '/api/health' ||
             req.url.startsWith('/static/');
    },
  },
  
  // Security middleware optimization
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false, // Reduce header overhead
    },
  },
  
  // Node.js optimization flags
  nodeFlags: [
    '--max-old-space-size=400', // Limit heap to 400MB (leave 112MB for other processes)
    '--optimize-for-size',       // Optimize for memory usage over speed
    '--gc-interval=100',         // More frequent garbage collection
    '--max-semi-space-size=64',  // Reduce semi-space size
  ],
  
  // Environment variables for memory optimization
  env: {
    NODE_OPTIONS: '--max-old-space-size=400 --optimize-for-size',
    UV_THREADPOOL_SIZE: '2', // Reduce thread pool size
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
};

// Memory monitoring and cleanup utilities
const memoryUtils = {
  // Get current memory usage
  getMemoryUsage: () => {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024), // MB
    };
  },
  
  // Log memory usage
  logMemoryUsage: () => {
    const usage = memoryUtils.getMemoryUsage();
    console.log(`Memory Usage - RSS: ${usage.rss}MB, Heap: ${usage.heapUsed}/${usage.heapTotal}MB`);
    
    // Warning if memory usage is high
    if (usage.rss > 450) { // Warning at 450MB (90% of 512MB)
      console.warn(`⚠️  High memory usage detected: ${usage.rss}MB RSS`);
    }
    
    return usage;
  },
  
  // Force garbage collection (if available)
  forceGC: () => {
    if (global.gc) {
      global.gc();
      console.log('🗑️  Forced garbage collection');
      return true;
    }
    return false;
  },
  
  // Cleanup intervals
  startMemoryMonitoring: () => {
    // Log memory usage every 5 minutes
    setInterval(() => {
      memoryUtils.logMemoryUsage();
    }, 5 * 60 * 1000);
    
    // Force GC every 10 minutes if available
    if (global.gc) {
      setInterval(() => {
        memoryUtils.forceGC();
      }, 10 * 60 * 1000);
    }
    
    // Emergency cleanup if memory usage is critical
    setInterval(() => {
      const usage = memoryUtils.getMemoryUsage();
      if (usage.rss > 480) { // Critical: 480MB (94% of 512MB)
        console.error(`🚨 Critical memory usage: ${usage.rss}MB - Attempting cleanup`);
        
        // Force GC
        if (global.gc) {
          global.gc();
        }
        
        // Clear any caches if available
        if (global.clearAllCaches) {
          global.clearAllCaches();
        }
      }
    }, 60 * 1000); // Check every minute
  },
};

// Response optimization middleware
const responseOptimization = (req, res, next) => {
  // Remove unnecessary headers to save bandwidth
  res.removeHeader('X-Powered-By');
  
  // Set optimized headers
  res.set({
    'Connection': 'keep-alive',
    'Keep-Alive': 'timeout=5, max=100',
  });
  
  // Override json method for memory efficiency
  const originalJson = res.json;
  res.json = function(obj) {
    // Remove undefined fields to reduce payload size
    const cleanObj = JSON.parse(JSON.stringify(obj));
    return originalJson.call(this, cleanObj);
  };
  
  next();
};

module.exports = {
  memoryOptimization,
  memoryUtils,
  responseOptimization,
};