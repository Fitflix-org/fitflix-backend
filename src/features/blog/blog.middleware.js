const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse({
        ...req.body,
        ...req.params,
        ...req.query
      });
      
      // Update request with validated data
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      next(error);
    }
  };
};

// Check if blog exists middleware
const blogExists = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Blog ID is required'
      });
    }

    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: `Blog with ID '${id}' not found`
      });
    }

    req.blog = blog;
    next();
  } catch (error) {
    console.error('Error checking blog existence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check blog existence',
      error: error.message
    });
  }
};

// Check if slug exists middleware
const slugExists = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Blog slug is required'
      });
    }

    const blog = await prisma.blog.findUnique({
      where: { slug }
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: `Blog with slug '${slug}' not found`
      });
    }

    req.blog = blog;
    next();
  } catch (error) {
    console.error('Error checking slug existence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check slug existence',
      error: error.message
    });
  }
};

// Check if slug is unique middleware
const slugUnique = async (req, res, next) => {
  try {
    const { slug } = req.body;
    const { id } = req.params; // For updates
    
    if (!slug) {
      return next(); // Skip if no slug provided
    }

    const existingBlog = await prisma.blog.findUnique({
      where: { slug }
    });

    if (existingBlog && existingBlog.id !== id) {
      return res.status(400).json({
        success: false,
        message: `Blog with slug '${slug}' already exists`
      });
    }

    next();
  } catch (error) {
    console.error('Error checking slug uniqueness:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check slug uniqueness',
      error: error.message
    });
  }
};

// Error handling middleware
const errorHandler = (error, req, res, next) => {
  console.error('Blog API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    params: req.params,
    body: req.body
  });

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    const validationErrors = error.errors && Array.isArray(error.errors) 
      ? error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      : [{ field: 'unknown', message: 'Validation failed' }];

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors
    });
  }

  // Prisma specific errors
  if (error.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'A blog with this information already exists'
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};

module.exports = {
  asyncHandler,
  validate,
  blogExists,
  slugExists,
  slugUnique,
  errorHandler
};
