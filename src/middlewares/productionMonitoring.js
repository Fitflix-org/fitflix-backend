// Production monitoring middleware for Fitflix Backend
// This middleware provides logging, metrics, and monitoring capabilities

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const accessLogPath = path.join(logsDir, 'access.log');
const errorLogPath = path.join(logsDir, 'error.log');
const metricsLogPath = path.join(logsDir, 'metrics.log');

// Simple file logger
const logToFile = (filePath, message) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;
    fs.appendFileSync(filePath, logEntry);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

// Metrics collection
const metrics = {
  requests: 0,
  errors: 0,
  startTime: Date.now(),
  responseTimes: [],
  endpoints: {}
};

// Cleanup old metrics periodically
setInterval(() => {
  // Keep only last 1000 response times
  if (metrics.responseTimes.length > 1000) {
    metrics.responseTimes = metrics.responseTimes.slice(-1000);
  }
}, 60000); // Clean every minute

// Production logging middleware
const productionLogging = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const startTime = Date.now();
  const originalSend = res.send;

  // Override res.send to capture response details
  res.send = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Log access
    const accessLog = `${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms - ${req.ip} - ${req.get('User-Agent') || 'Unknown'}`;
    logToFile(accessLogPath, accessLog);

    // Update metrics
    metrics.requests++;
    metrics.responseTimes.push(responseTime);
    
    // Track endpoint metrics
    const endpoint = `${req.method} ${req.route?.path || req.url}`;
    if (!metrics.endpoints[endpoint]) {
      metrics.endpoints[endpoint] = { count: 0, totalTime: 0, errors: 0 };
    }
    metrics.endpoints[endpoint].count++;
    metrics.endpoints[endpoint].totalTime += responseTime;
    
    if (res.statusCode >= 400) {
      metrics.errors++;
      metrics.endpoints[endpoint].errors++;
    }

    // Log errors
    if (res.statusCode >= 400) {
      const errorLog = `ERROR: ${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms - ${req.ip} - ${req.get('User-Agent') || 'Unknown'}`;
      logToFile(errorLogPath, errorLog);
    }

    // Log metrics periodically
    if (metrics.requests % 100 === 0) {
      logMetrics();
    }

    originalSend.call(this, data);
  };

  next();
};

// Log metrics to file
const logMetrics = () => {
  try {
    const avgResponseTime = metrics.responseTimes.length > 0 
      ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length 
      : 0;
    
    const uptime = Date.now() - metrics.startTime;
    const requestsPerMinute = (metrics.requests / (uptime / 60000)).toFixed(2);
    
    const metricsData = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime / 1000),
      requests: metrics.requests,
      errors: metrics.errors,
      errorRate: ((metrics.errors / metrics.requests) * 100).toFixed(2) + '%',
      avgResponseTime: Math.round(avgResponseTime) + 'ms',
      requestsPerMinute,
      endpoints: Object.keys(metrics.endpoints).length
    };

    logToFile(metricsLogPath, `METRICS: ${JSON.stringify(metricsData)}`);
  } catch (error) {
    console.error('Failed to log metrics:', error);
  }
};

// Health check with metrics
const getHealthMetrics = () => {
  const avgResponseTime = metrics.responseTimes.length > 0 
    ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length 
    : 0;
  
  const uptime = Date.now() - metrics.startTime;
  const requestsPerMinute = metrics.requests / (uptime / 60000);

  return {
    status: 'healthy',
    uptime: Math.floor(uptime / 1000),
    requests: metrics.requests,
    errors: metrics.errors,
    errorRate: metrics.requests > 0 ? ((metrics.errors / metrics.requests) * 100).toFixed(2) + '%' : '0%',
    avgResponseTime: Math.round(avgResponseTime) + 'ms',
    requestsPerMinute: Math.round(requestsPerMinute),
    endpoints: Object.keys(metrics.endpoints).length,
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };
};

// Error monitoring
const errorMonitoring = (error, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const errorLog = `CRITICAL ERROR: ${error.message} - Stack: ${error.stack} - URL: ${req.url} - Method: ${req.method} - IP: ${req.ip}`;
    logToFile(errorLogPath, errorLog);
    
    // Send error to monitoring service if configured
    if (process.env.ERROR_REPORTING_ENDPOINT) {
      // Implementation for external error reporting service
      console.log('Would send error to monitoring service:', error.message);
    }
  }
  
  next(error);
};

// Performance monitoring
const performanceMonitoring = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const responseTime = seconds * 1000 + nanoseconds / 1e6;
    
    // Log slow requests (> 1 second)
    if (responseTime > 1000) {
      const slowLog = `SLOW REQUEST: ${req.method} ${req.url} - ${responseTime.toFixed(2)}ms - ${req.ip}`;
      logToFile(errorLogPath, slowLog);
    }
  });

  next();
};

module.exports = {
  productionLogging,
  errorMonitoring,
  performanceMonitoring,
  getHealthMetrics,
  logMetrics
};
