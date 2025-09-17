// Memory-optimized event controller for low-RAM environments
const { getPrismaClient, createMemoryEfficientQueries } = require('../../config/database');

// Initialize optimized database queries
const prisma = getPrismaClient();
const queries = createMemoryEfficientQueries(prisma);

// Cache for frequently accessed data (with TTL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Memory-efficient cache helpers
const cacheHelpers = {
  set: (key, value, ttl = CACHE_TTL) => {
    // Limit cache size to prevent memory bloat
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, {
      data: value,
      expires: Date.now() + ttl,
    });
  },
  
  get: (key) => {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      cache.delete(key);
      return null;
    }
    
    return item.data;
  },
  
  clear: () => {
    cache.clear();
  },
};

// Memory-optimized event controllers
const eventController = {
  // Get upcoming events with caching and pagination
  getUpcomingEvents: async (req, res) => {
    try {
      const cacheKey = 'upcoming-events';
      const cached = cacheHelpers.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          events: cached,
          cached: true,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Use memory-efficient query
      const { events } = await queries.getPaginatedEvents(1, 20);
      
      // Cache the result
      cacheHelpers.set(cacheKey, events);
      
      res.json({
        success: true,
        events,
        cached: false,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('Error fetching upcoming events:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },
  
  // Get event by ID with minimal data loading
  getEventById: async (req, res) => {
    try {
      const { id } = req.params;
      const cacheKey = `event-${id}`;
      const cached = cacheHelpers.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          event: cached,
          cached: true,
        });
      }
      
      const event = await prisma.event.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          title1: true,
          title2: true,
          title3: true,
          description: true,
          details: true,
          coverImage: true,
          imageUrls: true,
          location: true,
          date: true,
          entryFee: true,
          status: true,
          responseCount: true,
          confirmedCount: true,
          createdAt: true,
          updatedAt: true,
          descriptionBlocks: true,
          descriptionBlocksRich: true,
          // Don't load responses by default to save memory
        },
      });
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }
      
      // Cache the result
      cacheHelpers.set(cacheKey, event);
      
      res.json({
        success: true,
        event,
        cached: false,
      });
      
    } catch (error) {
      console.error('Error fetching event:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },
  
  // Memory-efficient event registration
  createEventResponse: async (req, res) => {
    try {
      const { id: eventId } = req.params;
      const { name, phone, email } = req.body;
      
      // Check if event exists (minimal query)
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          title: true,
          status: true,
          date: true,
          responseCount: true,
        },
      });
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }
      
      if (event.status !== 'PUBLISHED') {
        return res.status(400).json({
          success: false,
          message: 'Event is not open for registration',
        });
      }
      
      if (new Date(event.date) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Event registration has closed',
        });
      }
      
      // Check for duplicate registration (efficient query)
      const existingResponse = await prisma.eventResponse.findFirst({
        where: {
          eventId,
          email,
        },
        select: { id: true },
      });
      
      if (existingResponse) {
        return res.status(400).json({
          success: false,
          message: 'You have already registered for this event',
        });
      }
      
      // Create registration and update count in transaction
      const [response] = await prisma.$transaction([
        prisma.eventResponse.create({
          data: {
            eventId,
            name: name.trim(),
            phone: phone.trim(),
            email: email.toLowerCase().trim(),
            status: 'PENDING',
          },
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.event.update({
          where: { id: eventId },
          data: {
            responseCount: {
              increment: 1,
            },
          },
        }),
      ]);
      
      // Clear cache for this event
      cacheHelpers.get(`event-${eventId}`) && cache.delete(`event-${eventId}`);
      cacheHelpers.get('upcoming-events') && cache.delete('upcoming-events');
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        response,
      });
      
    } catch (error) {
      console.error('Error creating event response:', error.message);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },
  
  // Health check for memory monitoring
  getMemoryHealth: async (req, res) => {
    const { memoryUtils } = require('../../config/memoryOptimization');
    const memoryUsage = memoryUtils.getMemoryUsage();
    const cacheStats = {
      size: cache.size,
      keys: Array.from(cache.keys()),
    };
    
    res.json({
      success: true,
      memory: memoryUsage,
      cache: cacheStats,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  },
  
  // Clear cache endpoint (for debugging)
  clearCache: async (req, res) => {
    cacheHelpers.clear();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    res.json({
      success: true,
      message: 'Cache cleared and garbage collection triggered',
      timestamp: new Date().toISOString(),
    });
  },
};

// Cleanup on process exit
process.on('exit', () => {
  cacheHelpers.clear();
});

process.on('beforeExit', () => {
  cacheHelpers.clear();
});

module.exports = eventController;