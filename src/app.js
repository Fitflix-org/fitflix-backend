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

// Import routes
const { router: authRoutes } = require('./features/auth/auth.routes');
const blogRoutes = require('./features/blog/blog.routes');
const userRoutes = require('./features/user/user.routes');

const app = express();

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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
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

// Production-ready middleware configuration with improved CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https:",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Needed for some frontend frameworks
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:",
        "https://images.unsplash.com",
        "https://lh3.googleusercontent.com",
        "https://www.google-analytics.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.fitflix.in",
        "https://fitflix-backend-avxt.onrender.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com"
      ],
      fontSrc: [
        "'self'", 
        "https:",
        "https://fonts.gstatic.com",
        "https://fonts.googleapis.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
    reportOnly: false, // Set to true for testing CSP
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration for production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // Cache preflight for 24 hours
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

// Security headers middleware
app.use((req, res, next) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
});

// Security middleware stack
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Prevent NoSQL injection

// Cookie parser with security options
app.use(cookieParser(process.env.COOKIE_SECRET || 'default-secret'));

// Body parsing with security limits
app.use(express.json({ 
  limit: '10mb',
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
  limit: '10mb',
  parameterLimit: 100 // Limit number of parameters
}));

// Secure cookie configuration
const getSecureCookieOptions = (req) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  domain: process.env.NODE_ENV === 'production' ? '.fitflix.in' : undefined,
  path: '/',
  signed: true
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Fitflix Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      allowedOrigins: allowedOrigins.length,
      production: process.env.NODE_ENV === 'production'
    }
  });
});

// Request validation middleware
app.use((req, res, next) => {
  // Validate request size
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({
      success: false,
      message: 'Request entity too large',
      maxSize: '10MB'
    });
  }
  
  // Validate content type for POST/PUT requests
  if ((req.method === 'POST' || req.method === 'PUT') && req.headers['content-type']) {
    if (!req.headers['content-type'].includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type must be application/json'
      });
    }
  }
  
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
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