// Database configuration optimized for low memory environments
const { PrismaClient } = require('@prisma/client');

// Memory-optimized Prisma configuration
const createOptimizedPrismaClient = () => {
  return new PrismaClient({
    // Reduce connection pool size for low memory
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    
    // Optimize for low memory usage
    __internal: {
      engine: {
        // Reduce memory footprint
        maxMemory: '200MB',
        // Reduce connection pool
        connectionLimit: 3,
      },
    },
    
    // Log only errors in production to save memory
    log: process.env.NODE_ENV === 'production' 
      ? ['error'] 
      : ['query', 'info', 'warn', 'error'],
      
    // Optimize query engine
    errorFormat: 'minimal',
  });
};

// Singleton pattern to avoid multiple instances
let prisma;

const getPrismaClient = () => {
  if (!prisma) {
    prisma = createOptimizedPrismaClient();
    
    // Graceful shutdown
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });
    
    process.on('SIGINT', async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }
  
  return prisma;
};

// Connection health check with memory optimization
const checkDatabaseHealth = async () => {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
};

// Memory-efficient query helpers
const createMemoryEfficientQueries = (prisma) => {
  return {
    // Paginated queries to limit memory usage
    getPaginatedBlogs: async (page = 1, limit = 10) => {
      const skip = (page - 1) * limit;
      const [blogs, total] = await Promise.all([
        prisma.blog.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            status: true,
            publishedAt: true,
            createdAt: true,
            // Exclude heavy fields like content
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.blog.count(),
      ]);
      
      return {
        blogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    
    // Get blog content separately to avoid loading all at once
    getBlogContent: async (id) => {
      return await prisma.blog.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          content: true,
          coverImage: true,
        },
      });
    },
    
    // Efficient event queries
    getPaginatedEvents: async (page = 1, limit = 20) => {
      const skip = (page - 1) * limit;
      const [events, total] = await Promise.all([
        prisma.event.findMany({
          skip,
          take: limit,
          where: {
            status: 'PUBLISHED',
            date: {
              gte: new Date(),
            },
          },
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            location: true,
            date: true,
            entryFee: true,
            status: true,
            responseCount: true,
            confirmedCount: true,
            // Exclude heavy fields
          },
          orderBy: { date: 'asc' },
        }),
        prisma.event.count({
          where: {
            status: 'PUBLISHED',
            date: {
              gte: new Date(),
            },
          },
        }),
      ]);
      
      return { events, total };
    },
    
    // Batch operations to reduce memory overhead
    batchUpdateEventCounts: async (eventUpdates) => {
      const updates = eventUpdates.map(({ id, responseCount, confirmedCount }) =>
        prisma.event.update({
          where: { id },
          data: { responseCount, confirmedCount },
          select: { id: true }, // Only select ID to save memory
        })
      );
      
      return await Promise.all(updates);
    },
  };
};

module.exports = {
  getPrismaClient,
  checkDatabaseHealth,
  createMemoryEfficientQueries,
};