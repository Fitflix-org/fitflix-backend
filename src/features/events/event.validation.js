const { z } = require('zod');

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// Event status enum
const eventStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']);

// Response status enum
const responseStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']);

// Create event validation schema
const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  title1: z.string().max(200).optional(),
  title2: z.string().max(200).optional(),
  title3: z.string().max(200).optional(),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  details: z
    .object({
      included: z.array(z.string()).optional(),
      benefits: z.array(z.string()).optional(),
      schedule: z.array(z.string()).optional(),
      routeInfo: z.string().optional()
    })
    .optional(),
  descriptionBlocks: z.array(z.string()).optional(),
  // Allow empty string to be treated as undefined for optional coverImage
  coverImage: z
    .string()
    .transform((val) => (val === '' ? undefined : val))
    .optional()
    .refine((val) => (val === undefined ? true : /^https?:\/\//.test(val)), 'Invalid cover image URL'),
  imageUrls: z.array(z.string().url('Invalid image URL')).optional().default([]),
  location: z.string().max(500, 'Location must be less than 500 characters').optional(),
  date: z.string().datetime('Invalid date format')
    .refine((date) => {
      const eventDate = new Date(date);
      const now = new Date();
      // Allow events up to 1 minute in the past to account for timezone differences
      const bufferTime = new Date(now.getTime() - 60000); // 1 minute buffer
      return eventDate > bufferTime;
    }, {
      message: 'Event date must be in the future (with 1 minute buffer for timezone differences)'
    }),
  entryFee: z.number().min(0, 'Entry fee cannot be negative').optional(),
  status: eventStatusSchema.optional().default('DRAFT')
});

// Update event validation schema
const updateEventSchema = createEventSchema.partial();

// Create event response validation schema
const createEventResponseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number must be less than 20 characters')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email format').max(255, 'Email must be less than 255 characters')
});

// Update event response validation schema
const updateEventResponseSchema = z.object({
  status: responseStatusSchema
});

// Event ID parameter validation
const eventIdParamSchema = z.object({
  id: uuidSchema
});

// Event response ID parameter validation
const eventResponseIdParamSchema = z.object({
  id: uuidSchema
});

// Event status parameter validation
const eventStatusParamSchema = z.object({
  status: eventStatusSchema
});

// Response status parameter validation
const responseStatusParamSchema = z.object({
  status: responseStatusSchema
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  createEventResponseSchema,
  updateEventResponseSchema,
  eventIdParamSchema,
  eventResponseIdParamSchema,
  eventStatusParamSchema,
  responseStatusParamSchema,
  uuidSchema,
  eventStatusSchema,
  responseStatusSchema
};

