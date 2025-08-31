const { z } = require('zod');

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// Blog status enum
const blogStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']);

// Create blog validation schema
const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().url('Invalid cover image URL').optional(),
  status: blogStatusSchema.optional().default('DRAFT'),
  scheduledPublishAt: z.string().datetime('Invalid date format').optional(),
  metaTitle: z.string().max(60, 'Meta title must be less than 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description must be less than 160 characters').optional(),
  metaKeywords: z.string().max(200, 'Meta keywords must be less than 200 characters').optional()
});

// Update blog validation schema
const updateBlogSchema = createBlogSchema.partial();

// Schedule publishing validation schema
const schedulePublishingSchema = z.object({
  scheduledPublishAt: z.string().datetime('Invalid date format')
    .refine((date) => {
      const scheduledDate = new Date(date);
      const now = new Date();
      // Allow scheduling up to 1 minute in the past to account for timezone differences
      const bufferTime = new Date(now.getTime() - 60000); // 1 minute buffer
      return scheduledDate > bufferTime;
    }, {
      message: 'Scheduled publish date must be in the future (with 1 minute buffer for timezone differences)'
    })
});

// Blog ID parameter validation
const blogIdParamSchema = z.object({
  id: uuidSchema
});

// Blog slug parameter validation
const blogSlugParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required')
});

// Blog status parameter validation
const blogStatusParamSchema = z.object({
  status: blogStatusSchema
});

module.exports = {
  createBlogSchema,
  updateBlogSchema,
  schedulePublishingSchema,
  blogIdParamSchema,
  blogSlugParamSchema,
  blogStatusParamSchema,
  uuidSchema,
  blogStatusSchema
};
