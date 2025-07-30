const rateLimit = require('express-rate-limit');

// General API rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retry_after: 15 * 60 // seconds
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retry_after: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Password reset rate limiting
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset attempts per hour
    message: {
        error: 'Too many password reset attempts, please try again later.',
        retry_after: 60 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Payment processing rate limiting
const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 payment requests per minute
    message: {
        error: 'Too many payment requests, please try again later.',
        retry_after: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// File upload rate limiting
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 upload requests per 15 minutes
    message: {
        error: 'Too many upload attempts, please try again later.',
        retry_after: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    paymentLimiter,
    uploadLimiter
};
