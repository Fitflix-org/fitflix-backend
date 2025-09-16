const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('./event.middleware');

const prisma = new PrismaClient();

// Get all events
const getAllEvents = asyncHandler(async (req, res) => {
  const { status, upcoming } = req.query;
  
  let whereClause = {};
  
  // Filter by status if provided
  if (status) {
    whereClause.status = status;
  }
  
  // Filter upcoming events if requested
  if (upcoming === 'true') {
    whereClause.date = {
      gte: new Date()
    };
  }
  
  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      responses: {
        select: {
          id: true,
          status: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  });

  // Add response count to each event and convert Decimal to number
  const eventsWithCounts = events.map(event => ({
    ...event,
    entryFee: event.entryFee ? parseFloat(event.entryFee.toString()) : null,
    responseCount: event.responses.length,
    confirmedCount: event.responses.filter(r => r.status === 'CONFIRMED').length
  }));

  res.json({
    success: true,
    events: eventsWithCounts
  });
});

// Get event by ID
const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      responses: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true
        }
      }
    }
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      message: `Event with ID '${id}' not found`
    });
  }

  // Add response counts
  const eventWithCounts = {
    ...event,
    responseCount: event.responses.length,
    confirmedCount: event.responses.filter(r => r.status === 'CONFIRMED').length
  };

  res.json({
    success: true,
    event: eventWithCounts
  });
});

// Get events by status
const getEventsByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  
  const events = await prisma.event.findMany({
    where: { status },
    include: {
      responses: {
        select: {
          id: true,
          status: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  });

  // Add response counts
  const eventsWithCounts = events.map(event => ({
    ...event,
    responseCount: event.responses.length,
    confirmedCount: event.responses.filter(r => r.status === 'CONFIRMED').length
  }));

  res.json({
    success: true,
    events: eventsWithCounts
  });
});

// Get upcoming events (public endpoint)
const getUpcomingEvents = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const events = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      date: {
        gte: now
      }
    },
    select: {
      id: true,
      title: true,
      title1: true,
      title2: true,
      title3: true,
      description: true,
      details: true,
  descriptionBlocks: true,
      coverImage: true,
      imageUrls: true,
      location: true,
      date: true,
      entryFee: true,
      createdAt: true,
      updatedAt: true,
      status: true
    },
    orderBy: {
      date: 'asc'
    }
  });

  res.json({
    success: true,
    events
  });
});

// Create new event (Admin only)
const createEvent = asyncHandler(async (req, res) => {
  const eventData = req.validatedData;

  const { descriptionBlocks: blocks, descriptionBlocksRich, ...rest } = eventData;
  const event = await prisma.event.create({
    data: {
      ...rest,
      descriptionBlocks: (blocks ?? descriptionBlocksRich) ?? undefined,
      date: new Date(eventData.date),
      entryFee: eventData.entryFee ? parseFloat(eventData.entryFee) : null
    }
  });

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    event
  });
});

// Update event (Admin only)
const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.validatedData;

  // Convert date and entryFee if provided
  const processedData = { ...updateData };
  if (updateData.date) {
    processedData.date = new Date(updateData.date);
  }
  if (updateData.entryFee !== undefined) {
    processedData.entryFee = updateData.entryFee ? parseFloat(updateData.entryFee) : null;
  }
  if (updateData.descriptionBlocks !== undefined) {
    processedData.descriptionBlocks = updateData.descriptionBlocks;
  }

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: processedData
  });

  res.json({
    success: true,
    message: 'Event updated successfully',
    event: updatedEvent
  });
});

// Delete event (Admin only)
const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.event.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
});

// Publish event (Admin only)
const publishEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      status: 'PUBLISHED'
    }
  });

  res.json({
    success: true,
    message: 'Event published successfully',
    event: updatedEvent
  });
});

// Cancel event (Admin only)
const cancelEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      status: 'CANCELLED'
    }
  });

  res.json({
    success: true,
    message: 'Event cancelled successfully',
    event: updatedEvent
  });
});

// Complete event (Admin only)
const completeEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      status: 'COMPLETED'
    }
  });

  res.json({
    success: true,
    message: 'Event marked as completed successfully',
    event: updatedEvent
  });
});

// Get event responses (Admin only)
const getEventResponses = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;
  
  let whereClause = { eventId: id };
  
  if (status) {
    whereClause.status = status;
  }
  
  const responses = await prisma.eventResponse.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    responses
  });
});

// Create event response (Public)
const createEventResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const responseData = req.validatedData;

  const eventResponse = await prisma.eventResponse.create({
    data: {
      ...responseData,
      eventId: id
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          location: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Event registration successful',
    response: eventResponse
  });
});

// Update event response status (Admin only)
const updateEventResponseStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.validatedData;

  const updatedResponse = await prisma.eventResponse.update({
    where: { id },
    data: { status },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          location: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Event response status updated successfully',
    response: updatedResponse
  });
});

// Delete event response (Admin only)
const deleteEventResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.eventResponse.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Event response deleted successfully'
  });
});

module.exports = {
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
};

