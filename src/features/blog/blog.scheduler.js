const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class BlogScheduler {
  constructor() {
    this.interval = null;
    this.isRunning = false;
    this.lastCheckTime = null;
    this.totalPublished = 0;
    this.lastError = null;
    this.startTime = null;
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('Blog scheduler is already running');
      return;
    }

    console.log('🚀 Starting blog scheduler...');
    this.isRunning = true;
    this.startTime = new Date();

    // Check every minute for blogs to publish
    this.interval = setInterval(async () => {
      await this.processScheduledBlogs();
    }, 60000); // 60 seconds

    // Also run immediately on start
    this.processScheduledBlogs();
    
    console.log('✅ Blog scheduler started successfully - checking every 60 seconds');
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
      this.lastCheckTime = now;
      
      // Find blogs that are scheduled and ready to publish
      const blogsToPublish = await prisma.blog.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledPublishAt: {
            lte: now
          }
        },
        select: {
          id: true,
          title: true,
          scheduledPublishAt: true,
          status: true
        }
      });

      if (blogsToPublish.length === 0) {
        // Log that no blogs are ready (but only occasionally to avoid spam)
        if (Math.random() < 0.1) { // Log ~10% of the time
          console.log(`📅 Scheduler check: No blogs ready to publish at ${now.toISOString()}`);
        }
        return;
      }

      console.log(`📅 Found ${blogsToPublish.length} scheduled blog(s) ready to publish at ${now.toISOString()}`);

      // Publish each blog
      let publishedCount = 0;
      for (const blog of blogsToPublish) {
        try {
          console.log(`🔄 Publishing blog: "${blog.title}" (scheduled for: ${blog.scheduledPublishAt})`);
          await this.publishScheduledBlog(blog);
          console.log(`✅ Successfully published: "${blog.title}" (ID: ${blog.id})`);
          publishedCount++;
          this.totalPublished++;
        } catch (error) {
          console.error(`❌ Failed to publish scheduled blog "${blog.title}" (ID: ${blog.id}):`, error);
          this.lastError = {
            time: now.toISOString(),
            blogId: blog.id,
            error: error.message
          };
        }
      }
      
      if (publishedCount > 0) {
        console.log(`🎉 Published ${publishedCount} blog(s) in this cycle. Total published: ${this.totalPublished}`);
      }
    } catch (error) {
      console.error('❌ Error processing scheduled blogs:', error);
      this.lastError = {
        time: new Date().toISOString(),
        error: error.message
      };
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
  async getStatus() {
    try {
      // Get count of scheduled blogs
      const scheduledBlogsCount = await prisma.blog.count({
        where: {
          status: 'SCHEDULED'
        }
      });

      // Get next scheduled blog time
      const nextScheduledBlog = await prisma.blog.findFirst({
        where: {
          status: 'SCHEDULED'
        },
        orderBy: {
          scheduledPublishAt: 'asc'
        },
        select: {
          title: true,
          scheduledPublishAt: true
        }
      });

      return {
        isRunning: this.isRunning,
        interval: this.interval ? '60 seconds' : null,
        lastCheck: this.lastCheckTime ? this.lastCheckTime.toISOString() : null,
        scheduledBlogsCount,
        nextScheduledBlog: nextScheduledBlog ? {
          title: nextScheduledBlog.title,
          scheduledFor: nextScheduledBlog.scheduledPublishAt
        } : null,
        uptime: this.isRunning ? 'Running' : 'Stopped',
        startTime: this.startTime ? this.startTime.toISOString() : null,
        totalPublished: this.totalPublished,
        lastError: this.lastError,
        performance: {
          checkInterval: '60 seconds',
          nextCheck: this.lastCheckTime ? new Date(this.lastCheckTime.getTime() + 60000).toISOString() : null
        }
      };
    } catch (error) {
      console.error('Error getting scheduler status:', error);
      return {
        isRunning: this.isRunning,
        interval: this.interval ? '60 seconds' : null,
        lastCheck: new Date().toISOString(),
        error: 'Failed to get detailed status'
      };
    }
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
