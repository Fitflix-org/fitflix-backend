const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../auth/auth.routes');
const {
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  getBlogsByStatus,
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  saveAsDraft,
  schedulePublishing,
  unschedulePublishing,
  getSchedulerStatus,
  startScheduler,
  stopScheduler,
  manualCheck
} = require('./blog.controller');

const {
  validate,
  blogExists,
  slugExists,
  slugUnique
} = require('./blog.middleware');

const {
  createBlogSchema,
  updateBlogSchema,
  schedulePublishingSchema,
  blogIdParamSchema,
  blogSlugParamSchema,
  blogStatusParamSchema
} = require('./blog.validation');

// Scheduler control routes (Admin only)
router.get('/scheduler/status', authenticateToken, requireAdmin, getSchedulerStatus);
router.post('/scheduler/start', authenticateToken, requireAdmin, startScheduler);
router.post('/scheduler/stop', authenticateToken, requireAdmin, stopScheduler);
router.post('/scheduler/check', authenticateToken, requireAdmin, manualCheck);

// GET /api/blogs - Get all blogs
router.get('/', getAllBlogs);

// GET /api/blogs/status/:status - Get blogs by status
router.get('/status/:status', 
  validate(blogStatusParamSchema), 
  getBlogsByStatus
);

// GET /api/blogs/slug/:slug - Get blog by slug
router.get('/slug/:slug', 
  validate(blogSlugParamSchema), 
  slugExists, 
  getBlogBySlug
);

// GET /api/blogs/:id - Get blog by ID
router.get('/:id', 
  validate(blogIdParamSchema), 
  blogExists, 
  getBlogById
);

// POST /api/blogs - Create new blog (Admin only)
router.post('/', 
  authenticateToken,
  requireAdmin,
  validate(createBlogSchema), 
  slugUnique, 
  createBlog
);

// PUT /api/blogs/:id - Update blog (Admin only)
router.put('/:id', 
  authenticateToken,
  requireAdmin,
  validate(blogIdParamSchema), 
  validate(updateBlogSchema), 
  blogExists, 
  slugUnique, 
  updateBlog
);

// DELETE /api/blogs/:id - Delete blog (Admin only)
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  validate(blogIdParamSchema), 
  blogExists, 
  deleteBlog
);

// Publish blog (Admin only)
router.patch('/:id/publish', 
  authenticateToken,
  requireAdmin,
  validate(blogIdParamSchema), 
  blogExists, 
  publishBlog
);

// Save blog as draft (Admin only)
router.patch('/:id/draft', 
  authenticateToken,
  requireAdmin,
  validate(blogIdParamSchema), 
  blogExists, 
  saveAsDraft
);

// Schedule blog publishing (Admin only)
router.patch('/:id/schedule', 
  authenticateToken,
  requireAdmin,
  validate(blogIdParamSchema), 
  validate(schedulePublishingSchema), 
  blogExists, 
  schedulePublishing
);

// Unschedule blog publishing (Admin only)
router.patch('/:id/unschedule', 
  authenticateToken,
  requireAdmin,
  validate(blogIdParamSchema), 
  blogExists, 
  unschedulePublishing
);

module.exports = router;
