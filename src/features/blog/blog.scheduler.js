const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class BlogScheduler {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('Blog scheduler is already running');
      return;
    }

    console.log('🚀 Starting blog scheduler...');
    this.isRunning = true;

    // Check every minute for blogs to publish
    this.interval = setInterval(async () => {
      await this.processScheduledBlogs();
    }, 60000); // 60 seconds

    // Also run immediately on start
    this.processScheduledBlogs();
  }

  // Stop the scheduler
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('🛑 Blog scheduler stopped');
  }

  // Process scheduled blogs that are ready to publish
  async processScheduledBlogs() {
    try {
      const now = new Date();
      
      // Find blogs that are scheduled and ready to publish
      const blogsToPublish = await prisma.blog.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledPublishAt: {
            lte: now
          }
        }
      });

      if (blogsToPublish.length === 0) {
        return;
      }

      console.log(`📅 Found ${blogsToPublish.length} scheduled blog(s) ready to publish`);

      // Publish each blog
      for (const blog of blogsToPublish) {
        try {
          await this.publishScheduledBlog(blog);
          console.log(`✅ Published scheduled blog: "${blog.title}" (ID: ${blog.id})`);
        } catch (error) {
          console.error(`❌ Failed to publish scheduled blog "${blog.title}" (ID: ${blog.id}):`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error processing scheduled blogs:', error);
    }
  }

  // Publish a single scheduled blog
  async publishScheduledBlog(blog) {
    const now = new Date();
    
    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: now,
        scheduledPublishAt: null
      }
    });
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      interval: this.interval ? '60 seconds' : null,
      lastCheck: new Date().toISOString()
    };
  }

  // Manually trigger a check (useful for testing)
  async manualCheck() {
    console.log('🔍 Manual check triggered');
    await this.processScheduledBlogs();
  }
}

// Create singleton instance
const blogScheduler = new BlogScheduler();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down blog scheduler...');
  blogScheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down blog scheduler...');
  blogScheduler.stop();
  process.exit(0);
});

module.exports = blogScheduler;
