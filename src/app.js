// src/app.js
// This file sets up the main Express application, applies global middlewares,
// and mounts the main API routes.

// Load environment variables only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const hpp = require('hpp'); // HTTP Parameter Pollution protection
const mongoSanitize = require('express-mongo-sanitize'); // MongoDB injection protection
const xss = require('xss-clean'); // XSS protection

// Import security configuration
const securityConfig = require('./config/security');

// Import middlewares
const subdomainRedirect = require('./middlewares/subdomainRedirect');

// Import routes
const { router: authRoutes } = require('./features/auth/auth.routes');
const blogRoutes = require('./features/blog/blog.routes');
const userRoutes = require('./features/user/user.routes');
const leadRoutes = require('./features/leads/leads.routes');

const app = express();

// Apply subdomain redirect middleware early in the stack
app.use(subdomainRedirect);

// Trust proxy configuration for production (behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  // Trust the first proxy (Render's load balancer)
  app.set('trust proxy', 1);
  console.log('🛡️ Trust proxy enabled for production');
  
  // Log proxy configuration for debugging
  console.log('🔍 Proxy configuration:', {
    trustProxy: app.get('trust proxy'),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
  
  // Add IP debugging middleware
  app.use((req, res, next) => {
    console.log('🌐 Request IP Debug:', {
      path: req.path,
      ip: req.ip,
      xForwardedFor: req.headers['x-forwarded-for'],
      xRealIp: req.headers['x-real-ip'],
      connectionRemoteAddress: req.connection?.remoteAddress,
      socketRemoteAddress: req.socket?.remoteAddress,
      trustProxy: app.get('trust proxy')
    });
    next();
  });
}

// HTTPS redirect for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
  
  // Compression middleware for production
  app.use(compression());
}

// Rate limiting for production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    ...securityConfig.rateLimit,
    // Disable X-Forwarded-For validation since we're handling it manually
    validate: { xForwardedForHeader: false },
    // Add key generator that works with proxy headers
    keyGenerator: (req) => {
      // Use X-Forwarded-For header if available, fallback to req.ip
      const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
      console.log('🔑 Rate limit key generated:', { clientIp, path: req.path });
      return clientIp;
    },
    // Skip rate limiting for health checks
    skip: (req) => req.path === '/health'
  });
  
  // Apply rate limiting to all routes
  app.use(limiter);
  
  // Stricter rate limiting for auth routes
  const authLimiter = rateLimit({
    ...securityConfig.rateLimit,
    max: securityConfig.rateLimit.authMax,
    message: {
      error: 'Too many authentication attempts, please try again later.'
    },
    // Disable X-Forwarded-For validation since we're handling it manually
    validate: { xForwardedForHeader: false },
    // Add key generator that works with proxy headers
    keyGenerator: (req) => {
      // Use X-Forwarded-For header if available, fallback to req.ip
      const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
      console.log('🔑 Auth rate limit key generated:', { clientIp, path: req.path });
      return clientIp;
    }
  });
  
  app.use('/api/auth', authLimiter);
}

// Production-ready middleware configuration with enhanced security headers
app.use(helmet({
  contentSecurityPolicy: securityConfig.csp,
  ...securityConfig.helmet
}));

// CORS configuration for production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      // Parse CORS_ORIGIN from environment variable
      ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : []),
      // Fallback to individual environment variables if CORS_ORIGIN is not set
      process.env.ADMIN_DASHBOARD_URL,
      process.env.WEBSITE_URL,
      process.env.FRONTEND_URL,
      'https://fitflix-web.onrender.com', // Explicitly allow frontend
      'https://fitflix.in' // Allow main domain
    ].filter(Boolean) // Remove undefined values
  : [
      process.env.ADMIN_DASHBOARD_URL || 'http://localhost:5173',
      process.env.WEBSITE_URL || 'http://localhost:8080',
      'http://localhost:8080', // Explicitly allow local frontend
      'http://localhost:3000'  // Allow local backend
    ];

// Log CORS configuration for debugging
console.log('🌐 CORS Configuration:', {
  environment: process.env.NODE_ENV,
  corsOrigin: process.env.CORS_ORIGIN,
  allowedOrigins: allowedOrigins,
  totalOrigins: allowedOrigins.length
});

// Validate CORS origins
if (process.env.NODE_ENV === 'production') {
  if (!process.env.CORS_ORIGIN) {
    console.warn('⚠️ CORS_ORIGIN environment variable not set in production');
  } else {
    const parsedOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
    console.log('🔍 Parsed CORS origins:', parsedOrigins);
  }
}

// Enhanced CORS configuration with better error handling
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log(`🌐 CORS: Allowing request with no origin`);
      return callback(null, true);
    }
    
    // Log CORS attempts for debugging
    console.log(`🌐 CORS check for origin: ${origin}`);
    console.log(`🌐 Allowed origins:`, allowedOrigins);
    console.log(`🌐 CORS_ORIGIN env var:`, process.env.CORS_ORIGIN);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS allowed for: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked for: ${origin}`);
      // Return a more informative error
      const error = new Error(`Origin ${origin} not allowed by CORS policy`);
      error.status = 403;
      error.code = 'CORS_ORIGIN_NOT_ALLOWED';
      callback(error);
    }
  },
  ...securityConfig.cors
}));

// Handle CORS preflight errors gracefully
app.use((err, req, res, next) => {
  if (err.code === 'CORS_ORIGIN_NOT_ALLOWED') {
    return res.status(403).json({
      success: false,
      message: 'CORS: Origin not allowed',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Forbidden',
      code: 'CORS_ERROR'
    });
  }
  next(err);
});

// Enhanced logging configuration
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400, // Only log errors in production
    stream: {
      write: (message) => console.log(message.trim())
    }
  }));
  
  // Add custom logging for proxy debugging
  app.use((req, res, next) => {
    if (req.path === '/health') {
      console.log('🏥 Health check request:', {
        ip: req.ip,
        xForwardedFor: req.headers['x-forwarded-for'],
        xRealIp: req.headers['x-real-ip'],
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
    next();
  });
} else {
  app.use(morgan('dev'));
}

// Enhanced security headers middleware with COOP/COEP
app.use((req, res, next) => {
  // Set all custom security headers from configuration
  Object.entries(securityConfig.customHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  // Enhanced Permissions Policy
  res.setHeader('Permissions-Policy', securityConfig.permissionsPolicy);
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
});

// Enhanced security middleware stack
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Prevent NoSQL injection

// Additional security middleware for deprecated APIs and enhanced protection
app.use((req, res, next) => {
  // Block requests with suspicious headers
  securityConfig.blockedPatterns.headers.forEach(header => {
    if (req.headers[header]) {
      console.warn(`🚨 Suspicious header detected: ${header}`);
      delete req.headers[header];
    }
  });
  
  // Block requests with suspicious query parameters
  const url = req.url.toLowerCase();
  
  if (securityConfig.blockedPatterns.urlParams.some(param => url.includes(param))) {
    console.warn(`🚨 Suspicious URL parameter detected: ${req.url}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid request parameters'
    });
  }
  
  next();
});

// Cookie parser with security options
app.use(cookieParser(process.env.COOKIE_SECRET || 'default-secret'));

// Body parsing with security limits
app.use(express.json({ 
  limit: securityConfig.requestValidation.maxSize,
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON payload' 
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: securityConfig.requestValidation.maxSize,
  parameterLimit: securityConfig.requestValidation.parameterLimit
}));

// Secure cookie configuration
const getSecureCookieOptions = (req) => ({
  ...securityConfig.cookie
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Get scheduler status if available
    let schedulerStatus = null;
    try {
      const blogScheduler = require('./features/blog/blog.scheduler');
      schedulerStatus = await blogScheduler.getStatus();
    } catch (error) {
      schedulerStatus = { error: 'Scheduler not available' };
    }

    res.json({
      status: 'OK',
      message: 'Fitflix Backend is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      scheduler: schedulerStatus,
      cors: {
        allowedOrigins: allowedOrigins.length,
        production: process.env.NODE_ENV === 'production',
        corsOrigin: process.env.CORS_ORIGIN,
        origins: allowedOrigins
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Request validation middleware
app.use((req, res, next) => {
  // Log all requests for debugging
  console.log(`🌐 ${req.method} ${req.url} - Origin: ${req.get('Origin') || 'No Origin'}`);
  
  // Validate request size
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > securityConfig.requestValidation.maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large',
      maxSize: `${securityConfig.requestValidation.maxSize / (1024 * 1024)}MB`
    });
  }
  
  // Validate content type for POST/PUT requests
  if ((req.method === 'POST' || req.method === 'PUT') && req.headers['content-type']) {
    if (!securityConfig.requestValidation.allowedContentTypes.some(type => 
      req.headers['content-type'].includes(type)
    )) {
      return res.status(400).json({
        success: false,
        message: `Content-Type must be one of: ${securityConfig.requestValidation.allowedContentTypes.join(', ')}`
      });
    }
  }
  
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);

// Debug: Log all registered routes
console.log('🚀 Registered API Routes:');
console.log('  - /api/auth/*');
console.log('  - /api/blogs/*');
console.log('  - /api/users/*');
console.log('  - /api/leads/*');
console.log('  - /health');
console.log('  - /security-test');
console.log('  - /test-routes');

// Debug: Test route registration
app.get('/test-routes', (req, res) => {
  res.json({
    message: 'Routes test endpoint',
    availableRoutes: [
      '/api/auth/*',
      '/api/blogs/*', 
      '/api/users/*',
      '/api/leads/*',
      '/health'
    ],
    testUrls: [
      '/api/blogs/status/PUBLISHED',
      '/api/blogs',
      '/api/auth/login',
      '/api/leads'
    ]
  });
});

// Security headers test endpoint
app.get('/security-test', (req, res) => {
  res.json({
    message: 'Security headers test endpoint',
    security: {
      csp: 'Content Security Policy is active',
      hsts: 'HTTP Strict Transport Security is active',
      coop: 'Cross-Origin-Opener-Policy is active',
      coep: 'Cross-Origin-Embedder-Policy is active',
      frameOptions: 'X-Frame-Options is set to DENY',
      clickjacking: 'Protected against clickjacking',
      xss: 'XSS protection is active',
      permissions: 'Permissions Policy is configured'
    },
    headers: {
      'content-security-policy': res.getHeader('content-security-policy'),
      'strict-transport-security': res.getHeader('strict-transport-security'),
      'cross-origin-opener-policy': res.getHeader('cross-origin-opener-policy'),
      'cross-origin-embedder-policy': res.getHeader('cross-origin-embedder-policy'),
      'x-frame-options': res.getHeader('x-frame-options'),
      'x-content-type-options': res.getHeader('x-content-type-options'),
      'x-xss-protection': res.getHeader('x-xss-protection'),
      'permissions-policy': res.getHeader('permissions-policy')
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  console.log(`🔍 Available routes: /api/auth/*, /api/blogs/*, /api/users/*, /api/leads/*, /health`);
  
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedUrl: req.url,
    method: req.method,
    availableRoutes: ['/api/auth/*', '/api/blogs/*', '/api/users/*', '/api/leads/*', '/health']
  });
});

// Global error handler
app.use((error, req, res, next) => {
  // Log error details
  if (process.env.NODE_ENV === 'production') {
    console.error('Production error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('Development error:', error);
  }
  
  // Don't leak error details in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message || 'Internal server error';
  
  res.status(error.status || 500).json({
    success: false,
    message: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error.message 
    })
  });
});

module.exports = app;