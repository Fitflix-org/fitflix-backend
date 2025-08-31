const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('./blog.middleware');
const blogScheduler = require('./blog.scheduler');

const prisma = new PrismaClient();

// Get all blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await prisma.blog.findMany({
    include: {
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    blogs
  });
});

// Get blog by ID
const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const blog = await prisma.blog.findUnique({
    where: { id }
  });

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: `Blog with ID '${id}' not found`
    });
  }

  res.json({
    success: true,
    blog
  });
});

// Get blog by slug
const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  
  const blog = await prisma.blog.findUnique({
    where: { slug }
  });

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: `Blog with slug '${slug}' not found`
    });
  }

  res.json({
    success: true,
    blog
  });
});

// Get blogs by status
const getBlogsByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  
  const blogs = await prisma.blog.findMany({
    where: { status },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    blogs
  });
});

// Create new blog
const createBlog = asyncHandler(async (req, res) => {
  const blogData = req.validatedData;

  const blog = await prisma.blog.create({
    data: blogData
  });

  res.status(201).json({
    success: true,
    message: 'Blog created successfully',
    blog
  });
});

// Update blog
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.validatedData;

  const updatedBlog = await prisma.blog.update({
    where: { id },
    data: updateData
  });

  res.json({
    success: true,
    message: 'Blog updated successfully',
    blog: updatedBlog
  });
});

// Delete blog
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.blog.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Blog deleted successfully'
  });
});

// Publish blog
const publishBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const updatedBlog = await prisma.blog.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
  });

  res.json({
    success: true,
    message: 'Blog published successfully',
    blog: updatedBlog
  });
});

// Save blog as draft
const saveAsDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const updatedBlog = await prisma.blog.update({
    where: { id },
    data: {
      status: 'DRAFT',
      publishedAt: null
    }
  });

  res.json({
    success: true,
    message: 'Blog saved as draft successfully',
    blog: updatedBlog
  });
});

// Schedule blog publishing
const schedulePublishing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { scheduledPublishAt } = req.validatedData;

  const updatedBlog = await prisma.blog.update({
    where: { id },
    data: {
      status: 'SCHEDULED',
      scheduledPublishAt: new Date(scheduledPublishAt)
    }
  });

  res.json({
    success: true,
    message: 'Blog scheduled for publishing successfully',
    blog: updatedBlog
  });
});

// Unschedule blog publishing
const unschedulePublishing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const updatedBlog = await prisma.blog.update({
    where: { id },
    data: {
      status: 'DRAFT',
      scheduledPublishAt: null
    }
  });

  res.json({
    success: true,
    message: 'Blog publishing unscheduled successfully',
    blog: updatedBlog
  });
});

// Get scheduler status
const getSchedulerStatus = asyncHandler(async (req, res) => {
  const status = await blogScheduler.getStatus();
  
  res.json({
    success: true,
    scheduler: status
  });
});

// Start scheduler
const startScheduler = asyncHandler(async (req, res) => {
  blogScheduler.start();
  
  res.json({
    success: true,
    message: 'Blog scheduler started successfully',
    scheduler: blogScheduler.getStatus()
  });
});

// Stop scheduler
const stopScheduler = asyncHandler(async (req, res) => {
  blogScheduler.stop();
  
  res.json({
    success: true,
    message: 'Blog scheduler stopped successfully',
    scheduler: blogScheduler.getStatus()
  });
});

// Manual check
const manualCheck = asyncHandler(async (req, res) => {
  await blogScheduler.manualCheck();
  
  res.json({
    success: true,
    message: 'Manual check completed',
    scheduler: blogScheduler.getStatus()
  });
});

module.exports = {
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
};
