// Security configuration for Fitflix Backend
// This file centralizes all security-related configurations

const securityConfig = {
  // Content Security Policy configuration
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", // Required for dynamic styles
        "https:",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some frontend frameworks
        "'unsafe-eval'", // Required for some modern frameworks
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:",
        "https://images.unsplash.com",
        "https://lh3.googleusercontent.com",
        "https://www.google-analytics.com",
        "https://fitflix.in",
        "https://*.fitflix.in"
      ],
      connectSrc: [
        "'self'",
        "https://api.fitflix.in",
        "https://fitflix-backend-avxt.onrender.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
        "https://fitflix.in",
        "https://*.fitflix.in"
      ],
      fontSrc: [
        "'self'", 
        "https:",
        "https://fonts.gstatic.com",
        "https://fonts.googleapis.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'none'"], // Prevents clickjacking
      frameAncestors: ["'none'"], // Additional clickjacking protection
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      // Additional security directives
      requireTrustedTypesFor: ["'script'"],
      trustedTypes: ["default"],
    },
    reportOnly: false,
    reportUri: process.env.CSP_REPORT_URI || null,
  },

  // Helmet configuration
  helmet: {
    contentSecurityPolicy: true, // Will use the csp config above
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
      force: true
    },
    noSniff: true,
    ieNoOpen: true,
    hidePoweredBy: true,
    frameguard: { action: "deny" },
    xssFilter: true,
  },

  // Custom security headers
  customHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
  },

  // Permissions Policy
  permissionsPolicy: [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'encrypted-media=()',
    'fullscreen=()',
    'picture-in-picture=()',
    'publickey-credentials-get=()',
    'screen-wake-lock=()',
    'sync-xhr=()',
    'web-share=()',
    'xr-spatial-tracking=()'
  ].join(', '),

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    authMax: 5, // stricter limit for auth routes
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // CORS configuration
  cors: {
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
  },

  // Cookie security
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.NODE_ENV === 'production' ? '.fitflix.in' : undefined,
    path: '/',
    signed: true
  },

  // Request validation
  requestValidation: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedContentTypes: ['application/json'],
    parameterLimit: 100
  },

  // Suspicious patterns to block
  blockedPatterns: {
    headers: [
      'x-forwarded-host',
      'x-forwarded-server',
      'x-forwarded-uri',
      'x-original-url',
      'x-rewrite-url'
    ],
    urlParams: ['javascript:', 'vbscript:', 'data:', 'file:']
  }
};

module.exports = securityConfig;
