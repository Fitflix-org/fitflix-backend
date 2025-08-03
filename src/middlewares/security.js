const helmet = require('helmet');
const cors = require('cors');

/**
 * Security middleware configuration
 */
function configureSecurity(app) {
    // Helmet for security headers
    app.use(helmet({
        // Content Security Policy
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'", "https://api.razorpay.com"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: []
            }
        },
        // Hide X-Powered-By header
        hidePoweredBy: true,
        // HSTS (HTTP Strict Transport Security)
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        // Prevent MIME type sniffing
        noSniff: true,
        // XSS Protection
        xssFilter: true,
        // Referrer Policy
        referrerPolicy: { policy: "same-origin" }
    }));

    // CORS configuration
    const corsOptions = {
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, postman, etc.)
            if (!origin) return callback(null, true);
            
            // In production, specify allowed origins
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:8080',
                'https://fitflix.app', // Add your production domain
                'https://www.fitflix.app'
            ];
            
            if (process.env.NODE_ENV === 'development') {
                return callback(null, true);
            }
            
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true, // Allow cookies
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
    };

    app.use(cors(corsOptions));

    // Additional security headers
    app.use((req, res, next) => {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');
        
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Referrer policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Feature policy / Permissions policy
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        next();
    });
}

/**
 * Request size limits
 */
const requestLimits = {
    // General JSON limit
    json: '10mb',
    // URL encoded limit  
    urlencoded: '10mb',
    // File upload limit
    fileUpload: '50mb'
};

/**
 * IP whitelist middleware (for webhook endpoints)
 */
function ipWhitelist(allowedIPs) {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        
        if (allowedIPs.includes(clientIP) || allowedIPs.includes('127.0.0.1')) {
            return next();
        }
        
        return res.status(403).json({
            error: 'Access denied: IP not whitelisted'
        });
    };
}

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
    const start = Date.now();
    
    // Log request
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    
    // Log response time
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
}

/**
 * Error response middleware
 */
function secureErrorHandler(err, req, res, next) {
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.error('Security Error:', err);
    
    // Only handle specific security errors
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({
            error: 'CORS policy violation'
        });
    }
    
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            error: 'Invalid CSRF token'
        });
    }
    
    // Pass other errors to the next error handler
    next(err);
}

module.exports = {
    configureSecurity,
    requestLimits,
    ipWhitelist,
    requestLogger,
    secureErrorHandler
};
