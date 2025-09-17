// Memory monitoring and optimization middleware for production
const { memoryUtils } = require('../config/memoryOptimization');

// Memory monitoring middleware
const memoryMonitoring = (req, res, next) => {
  // Skip monitoring for health checks to reduce overhead
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  
  // Log memory usage for high-memory operations
  const isHighMemoryRoute = req.path.includes('/events') || 
                           req.path.includes('/blogs') ||
                           req.method === 'POST';
  
  if (isHighMemoryRoute) {
    const startMemory = process.memoryUsage();
    
    // Override res.end to capture memory usage after response
    const originalEnd = res.end;
    res.end = function(...args) {
      const endMemory = process.memoryUsage();
      const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;
      
      // Log if memory usage increased significantly
      if (memoryDiff > 10 * 1024 * 1024) { // 10MB threshold
        console.warn(`⚠️  High memory usage on ${req.method} ${req.path}: +${Math.round(memoryDiff / 1024 / 1024)}MB`);
      }
      
      originalEnd.apply(this, args);
    };
  }
  
  next();
};

// Request cleanup middleware
const requestCleanup = (req, res, next) => {
  // Cleanup request data to prevent memory leaks
  res.on('finish', () => {
    // Clear large request bodies
    if (req.body && typeof req.body === 'object') {
      req.body = null;
    }
    
    // Clear file uploads if any
    if (req.files) {
      req.files = null;
    }
  });
  
  next();
};

// Response size limiting middleware
const responseSizeLimit = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(obj) {
    try {
      const jsonString = JSON.stringify(obj);
      const sizeInMB = Buffer.byteLength(jsonString, 'utf8') / 1024 / 1024;
      
      // Warn about large responses
      if (sizeInMB > 5) { // 5MB threshold
        console.warn(`⚠️  Large response on ${req.method} ${req.path}: ${sizeInMB.toFixed(2)}MB`);
      }
      
      // For very large responses, paginate or truncate
      if (sizeInMB > 10) { // 10MB limit
        console.error(`🚨 Response too large on ${req.method} ${req.path}: ${sizeInMB.toFixed(2)}MB - Truncating`);
        
        // If it's an array, truncate it
        if (Array.isArray(obj.data)) {
          obj.data = obj.data.slice(0, 100); // Limit to 100 items
          obj.truncated = true;
          obj.message = 'Response truncated due to size limits. Use pagination.';
        }
      }
      
      return originalJson.call(this, obj);
    } catch (error) {
      console.error('Error in response size limiting:', error.message);
      return originalJson.call(this, obj);
    }
  };
  
  next();
};

// Emergency memory cleanup middleware
const emergencyCleanup = (req, res, next) => {
  const usage = memoryUtils.getMemoryUsage();
  
  // If memory usage is critical, trigger cleanup
  if (usage.rss > 480) { // 94% of 512MB
    console.error(`🚨 Critical memory usage: ${usage.rss}MB - Emergency cleanup triggered`);
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    // Clear any caches
    if (global.clearAllCaches) {
      global.clearAllCaches();
    }
    
    // If still critical, send 503 Service Unavailable
    const newUsage = memoryUtils.getMemoryUsage();
    if (newUsage.rss > 500) {
      return res.status(503).json({
        success: false,
        message: 'Server temporarily unavailable due to high memory usage',
        error: 'MEMORY_LIMIT_EXCEEDED',
      });
    }
  }
  
  next();
};

// Periodic cleanup task
const startPeriodicCleanup = () => {
  // Clean up every 5 minutes
  setInterval(() => {
    const usage = memoryUtils.getMemoryUsage();
    
    if (usage.rss > 400) { // 78% of 512MB
      console.log(`🧹 Periodic cleanup triggered - Memory: ${usage.rss}MB`);
      
      if (global.gc) {
        global.gc();
      }
      
      // Clear expired cache entries
      if (global.clearExpiredCache) {
        global.clearExpiredCache();
      }
    }
  }, 5 * 60 * 1000);
  
  // Log memory usage every 10 minutes
  setInterval(() => {
    memoryUtils.logMemoryUsage();
  }, 10 * 60 * 1000);
};

module.exports = {
  memoryMonitoring,
  requestCleanup,
  responseSizeLimit,
  emergencyCleanup,
  startPeriodicCleanup,
};