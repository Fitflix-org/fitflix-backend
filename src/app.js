// src/app.js
// This file sets up the main Express application, applies global middlewares,
// and mounts the main API routes.

require('dotenv').config(); // Load environment variables at the very top
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Import routes
const { router: authRoutes } = require('./features/auth/auth.routes');
const blogRoutes = require('./features/blog/blog.routes');
const userRoutes = require('./features/user/user.routes');

const app = express();

// Compression middleware for production
if (process.env.NODE_ENV === 'production') {
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
  });
  
  app.use('/api/auth', authLimiter);
}

// Production-ready middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration for production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.ADMIN_DASHBOARD_URL,
      process.env.WEBSITE_URL,
      process.env.FRONTEND_URL
    ].filter(Boolean) // Remove undefined values
  : [
      process.env.ADMIN_DASHBOARD_URL || 'http://localhost:5173',
      process.env.WEBSITE_URL || 'http://localhost:8080'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Logging configuration
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Fitflix Blog API is running',
    timestamp: new Date().toISOString()
  });
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