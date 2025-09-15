const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const dataToValidate = { ...req.body, ...req.params, ...req.query };
      const validatedData = schema.parse(dataToValidate);
      
      // Store validated data in request object
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors?.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })) || [];
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages
        });
      }
      
      next(error);
    }
  };
};

// Check if event exists
const eventExists = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const event = await prisma.event.findUnique({
    where: { id }
  });
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: `Event with ID '${id}' not found`
    });
  }
  
  req.event = event;
  next();
});

// Check if event response exists
const eventResponseExists = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const eventResponse = await prisma.eventResponse.findUnique({
    where: { id },
    include: {
      event: true
    }
  });
  
  if (!eventResponse) {
    return res.status(404).json({
      success: false,
      message: `Event response with ID '${id}' not found`
    });
  }
  
  req.eventResponse = eventResponse;
  next();
});

// Check if event is published (for public access)
const eventIsPublished = asyncHandler(async (req, res, next) => {
  const event = req.event;
  
  if (event.status !== 'PUBLISHED') {
    return res.status(404).json({
      success: false,
      message: 'Event not found or not published'
    });
  }
  
  next();
});

// Check if event is open for registration
const eventIsOpenForRegistration = asyncHandler(async (req, res, next) => {
  const event = req.event;
  const now = new Date();
  
  // Check if event is published and not cancelled
  if (event.status !== 'PUBLISHED') {
    return res.status(400).json({
      success: false,
      message: 'Event is not open for registration'
    });
  }
  
  // Check if event date is in the future
  if (event.date <= now) {
    return res.status(400).json({
      success: false,
      message: 'Event registration is closed'
    });
  }
  
  next();
});

// Check if email is already registered for the event
const emailNotAlreadyRegistered = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Route defines param as :id
  const { email } = req.validatedData;
  
  const existingResponse = await prisma.eventResponse.findFirst({
    where: {
      eventId: id,
      email
    }
  });
  
  if (existingResponse) {
    return res.status(400).json({
      success: false,
      message: 'Email is already registered for this event'
    });
  }
  
  next();
});

module.exports = {
  asyncHandler,
  validate,
  eventExists,
  eventResponseExists,
  eventIsPublished,
  eventIsOpenForRegistration,
  emailNotAlreadyRegistered
};
