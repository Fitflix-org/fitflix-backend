const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPublish() {
  try {
    console.log('🧪 Testing Blog Publishing with New Schema...\n');

    // Get a blog to test with
    const blogs = await prisma.blog.findMany({
      take: 1
    });

    if (blogs.length === 0) {
      console.log('❌ No blogs found in database');
      return;
    }

    const blog = blogs[0];
    console.log(`📝 Testing with blog: "${blog.title}" (ID: ${blog.id})`);
    console.log(`   Current status: ${blog.status}`);
    console.log(`   Published at: ${blog.publishedAt || 'Not published'}\n`);

    // Test publishing
    console.log('🚀 Publishing blog...');
    const updatedBlog = await prisma.blog.update({
      where: { id: blog.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });

    console.log(`✅ Blog published successfully!`);
    console.log(`   New status: ${updatedBlog.status}`);
    console.log(`   Published at: ${updatedBlog.publishedAt}`);
    console.log(`   Updated at: ${updatedBlog.updatedAt}\n`);

    // Test saving as draft
    console.log('📝 Saving blog as draft...');
    const draftBlog = await prisma.blog.update({
      where: { id: blog.id },
      data: {
        status: 'DRAFT',
        publishedAt: null
      }
    });

    console.log(`✅ Blog saved as draft!`);
    console.log(`   New status: ${draftBlog.status}`);
    console.log(`   Published at: ${draftBlog.publishedAt || 'Not published'}`);
    console.log(`   Updated at: ${draftBlog.updatedAt}\n`);

    // Test scheduling
    console.log('⏰ Scheduling blog for publishing...');
    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 5); // 5 minutes from now
    
    const scheduledBlog = await prisma.blog.update({
      where: { id: blog.id },
      data: {
        status: 'SCHEDULED',
        scheduledPublishAt: futureDate
      }
    });

    console.log(`✅ Blog scheduled successfully!`);
    console.log(`   New status: ${scheduledBlog.status}`);
    console.log(`   Scheduled for: ${scheduledBlog.scheduledPublishAt}`);
    console.log(`   Updated at: ${scheduledBlog.updatedAt}\n`);

    // Test unscheduling
    console.log('❌ Unschedule blog...');
    const unscheduledBlog = await prisma.blog.update({
      where: { id: blog.id },
      data: {
        status: 'DRAFT',
        scheduledPublishAt: null
      }
    });

    console.log(`✅ Blog unscheduled successfully!`);
    console.log(`   New status: ${unscheduledBlog.status}`);
    console.log(`   Scheduled for: ${unscheduledBlog.scheduledPublishAt || 'Not scheduled'}`);
    console.log(`   Updated at: ${unscheduledBlog.updatedAt}\n`);

    console.log('🎉 All tests passed! The new schema is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPublish();
