const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../auth/auth.routes');
const {
  getAllEvents,
  getEventById,
  getEventsByStatus,
  getUpcomingEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
  completeEvent,
  getEventResponses,
  createEventResponse,
  updateEventResponseStatus,
  deleteEventResponse
} = require('./event.controller');

const {
  validate,
  eventExists,
  eventResponseExists,
  eventIsPublished,
  eventIsOpenForRegistration,
  emailNotAlreadyRegistered
} = require('./event.middleware');

const {
  createEventSchema,
  updateEventSchema,
  createEventResponseSchema,
  updateEventResponseSchema,
  eventIdParamSchema,
  eventResponseIdParamSchema,
  eventStatusParamSchema,
  responseStatusParamSchema
} = require('./event.validation');

// ========== PUBLIC ROUTES ==========

// GET /api/events/upcoming - Get upcoming published events (Public)
router.get('/upcoming', getUpcomingEvents);

// GET /api/events/:id - Get event by ID (Public for published events)
router.get('/:id', 
  validate(eventIdParamSchema), 
  eventExists,
  eventIsPublished,
  getEventById
);

// POST /api/events/:id/register - Register for an event (Public)
router.post('/:id/register', 
  validate(eventIdParamSchema),
  validate(createEventResponseSchema),
  eventExists,
  eventIsPublished,
  eventIsOpenForRegistration,
  emailNotAlreadyRegistered,
  createEventResponse
);

// ========== ADMIN ROUTES ==========

// GET /api/events - Get all events (Admin only)
router.get('/', 
  authenticateToken,
  requireAdmin,
  getAllEvents
);

// GET /api/events/status/:status - Get events by status (Admin only)
router.get('/status/:status', 
  authenticateToken,
  requireAdmin,
  validate(eventStatusParamSchema), 
  getEventsByStatus
);

// POST /api/events - Create new event (Admin only)
router.post('/', 
  authenticateToken,
  requireAdmin,
  validate(createEventSchema), 
  createEvent
);

// PUT /api/events/:id - Update event (Admin only)
router.put('/:id', 
  authenticateToken,
  requireAdmin,
  validate(eventIdParamSchema), 
  validate(updateEventSchema), 
  eventExists, 
  updateEvent
);

// DELETE /api/events/:id - Delete event (Admin only)
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  validate(eventIdParamSchema), 
  eventExists, 
  deleteEvent
);

// PATCH /api/events/:id/publish - Publish event (Admin only)
router.patch('/:id/publish', 
  authenticateToken,
  requireAdmin,
  validate(eventIdParamSchema), 
  eventExists, 
  publishEvent
);

// PATCH /api/events/:id/cancel - Cancel event (Admin only)
router.patch('/:id/cancel', 
  authenticateToken,
  requireAdmin,
  validate(eventIdParamSchema), 
  eventExists, 
  cancelEvent
);

// PATCH /api/events/:id/complete - Mark event as completed (Admin only)
router.patch('/:id/complete', 
  authenticateToken,
  requireAdmin,
  validate(eventIdParamSchema), 
  eventExists, 
  completeEvent
);

// ========== EVENT RESPONSES MANAGEMENT (Admin only) ==========

// GET /api/events/:id/responses - Get event responses (Admin only)
router.get('/:id/responses', 
  authenticateToken,
  requireAdmin,
  validate(eventIdParamSchema), 
  eventExists, 
  getEventResponses
);

// PUT /api/events/responses/:id - Update event response status (Admin only)
router.put('/responses/:id', 
  authenticateToken,
  requireAdmin,
  validate(eventResponseIdParamSchema), 
  validate(updateEventResponseSchema),
  eventResponseExists, 
  updateEventResponseStatus
);

// DELETE /api/events/responses/:id - Delete event response (Admin only)
router.delete('/responses/:id', 
  authenticateToken,
  requireAdmin,
  validate(eventResponseIdParamSchema), 
  eventResponseExists, 
  deleteEventResponse
);

//

module.exports = router;
