const Joi = require('joi');

// Validation schemas
const schemas = {
    // Auth schemas
    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        })
    }),

    register: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        }),
        username: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).min(3).max(30).required().messages({
            'string.pattern.base': 'Username must contain only letters, numbers, underscores, and hyphens',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username cannot exceed 30 characters',
            'any.required': 'Username is required'
        })
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string().required().messages({
            'any.required': 'Current password is required'
        }),
        newPassword: Joi.string().min(6).required().messages({
            'string.min': 'New password must be at least 6 characters long',
            'any.required': 'New password is required'
        })
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
    }),

    resetPassword: Joi.object({
        token: Joi.string().required().messages({
            'any.required': 'Reset token is required'
        }),
        newPassword: Joi.string().min(6).required().messages({
            'string.min': 'New password must be at least 6 characters long',
            'any.required': 'New password is required'
        })
    }),

    refreshToken: Joi.object({
        refreshToken: Joi.string().required().messages({
            'any.required': 'Refresh token is required'
        })
    }),

    // User profile schemas
    updateProfile: Joi.object({
        date_of_birth: Joi.date().max('now').optional(),
        height_cm: Joi.number().min(50).max(300).optional(),
        weight_kg: Joi.number().min(20).max(500).optional(),
        primary_fitness_goal: Joi.string().valid('weight_loss', 'muscle_gain', 'endurance', 'strength', 'general_fitness').optional(),
        gender: Joi.string().valid('male', 'female', 'other').optional(),
        dietary_preferences: Joi.array().items(Joi.string()).optional(),
        allergies: Joi.array().items(Joi.string()).optional()
    }),

    // Nutrition schemas
    logNutrition: Joi.object({
        meal_type: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').required(),
        food_item: Joi.string().min(1).max(200).required(),
        calories_per_serving: Joi.number().min(0).required(),
        protein_g: Joi.number().min(0).optional(),
        carbs_g: Joi.number().min(0).optional(),
        fat_g: Joi.number().min(0).optional(),
        servings: Joi.number().min(0.1).max(20).default(1)
    }),

    // Chatbot schemas
    chatbotMessage: Joi.object({
        message: Joi.string().min(1).max(1000).required().messages({
            'string.min': 'Message cannot be empty',
            'string.max': 'Message cannot exceed 1000 characters',
            'any.required': 'Message is required'
        }),
        includeContext: Joi.boolean().default(true)
    }),

    // Payment schemas
    createPayment: Joi.object({
        gym_id: Joi.number().integer().positive().required(),
        plan_id: Joi.number().integer().positive().required(),
        plan_type: Joi.string().valid('monthly', 'quarterly', 'yearly').required()
    }),

    verifyPayment: Joi.object({
        razorpay_order_id: Joi.string().required(),
        razorpay_payment_id: Joi.string().required(),
        razorpay_signature: Joi.string().required()
    }),

    // Query parameter schemas
    paginationQuery: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    }),

    gymQuery: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional(),
        radius: Joi.number().min(1).max(100).default(10).optional(),
        amenities: Joi.array().items(Joi.string()).optional()
    }),

    nutritionQuery: Joi.object({
        date: Joi.date().optional(),
        meal_type: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').optional()
    })
};

/**
 * Validation middleware factory
 * @param {string} schemaName - Name of the schema to validate against
 * @param {string} property - Property to validate (body, query, params)
 * @returns {Function} Express middleware function
 */
function validate(schemaName, property = 'body') {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(500).json({
                error: 'Internal server error: Invalid validation schema'
            });
        }

        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors
            stripUnknown: true // Remove unknown properties
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        // Replace the property with validated and sanitized value
        req[property] = value;
        next();
    };
}

// Input sanitization middleware
function sanitizeInput(req, res, next) {
    // Helper function to sanitize strings
    function sanitizeString(str) {
        if (typeof str !== 'string') return str;
        return str.trim().replace(/[<>]/g, ''); // Basic XSS prevention
    }

    // Helper function to recursively sanitize object
    function sanitizeObject(obj) {
        if (obj === null || obj === undefined) return obj;
        
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        
        if (typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = sanitizeObject(value);
            }
            return sanitized;
        }
        
        return obj;
    }

    // Sanitize request body, query, and params
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
}

module.exports = {
    validate,
    sanitizeInput,
    schemas
};
