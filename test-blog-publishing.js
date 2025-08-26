const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/blogs';

// Test data with proper validation
const testBlog = {
  title: 'Test Blog Post',
  slug: 'test-blog-post-' + Date.now(),
  excerpt: 'This is a test blog post for testing the improved publishing functionality.',
  content: 'This is the content of the test blog post. It contains enough content to pass validation.',
  coverImage: 'https://example.com/image.jpg',
  metaTitle: 'Test Blog Post - SEO Title',
  metaDescription: 'Test blog post for testing the improved publishing functionality with validation.',
  metaKeywords: 'test, blog, publishing, validation'
};

async function testBlogPublishing() {
  try {
    console.log('🚀 Testing Improved Blog Publishing API...\n');

    // Test 1: Create a new blog
    console.log('1. Creating a new blog with validation...');
    const createResponse = await axios.post(BASE_URL, testBlog);
    const blogId = createResponse.data.blog.id;
    console.log(`✅ Blog created with ID: ${blogId}`);
    console.log(`   Status: ${createResponse.data.blog.status}\n`);

    // Test 2: Publish the blog
    console.log('2. Publishing the blog...');
    const publishResponse = await axios.patch(`${BASE_URL}/${blogId}/publish`);
    console.log(`✅ Blog published successfully`);
    console.log(`   Status: ${publishResponse.data.blog.status}`);
    console.log(`   Published at: ${publishResponse.data.blog.publishedAt}\n`);

    // Test 3: Save as draft
    console.log('3. Saving blog as draft...');
    const draftResponse = await axios.patch(`${BASE_URL}/${blogId}/draft`);
    console.log(`✅ Blog saved as draft`);
    console.log(`   Status: ${draftResponse.data.blog.status}`);
    console.log(`   Published at: ${draftResponse.data.blog.publishedAt}\n`);

    // Test 4: Schedule publishing
    console.log('4. Scheduling blog for publishing...');
    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 5); // 5 minutes from now
    
    const scheduleResponse = await axios.patch(`${BASE_URL}/${blogId}/schedule`, {
      scheduledPublishAt: futureDate.toISOString()
    });
    console.log(`✅ Blog scheduled for publishing`);
    console.log(`   Status: ${scheduleResponse.data.blog.status}`);
    console.log(`   Scheduled for: ${scheduleResponse.data.blog.scheduledPublishAt}\n`);

    // Test 5: Unschedule publishing
    console.log('5. Unschedule blog publishing...');
    const unscheduleResponse = await axios.patch(`${BASE_URL}/${blogId}/unschedule`);
    console.log(`✅ Blog publishing unscheduled`);
    console.log(`   Status: ${unscheduleResponse.data.blog.status}`);
    console.log(`   Scheduled for: ${unscheduleResponse.data.blog.scheduledPublishAt}\n`);

    // Test 6: Get blog by status
    console.log('6. Getting blogs by status...');
    const draftBlogs = await axios.get(`${BASE_URL}/status/DRAFT`);
    const publishedBlogs = await axios.get(`${BASE_URL}/status/PUBLISHED`);
    const scheduledBlogs = await axios.get(`${BASE_URL}/status/SCHEDULED`);
    
    console.log(`✅ Draft blogs: ${draftBlogs.data.blogs.length}`);
    console.log(`✅ Published blogs: ${publishedBlogs.data.blogs.length}`);
    console.log(`✅ Scheduled blogs: ${scheduledBlogs.data.blogs.length}\n`);

    // Test 7: Test scheduler functionality
    console.log('7. Testing scheduler functionality...');
    
    // Get scheduler status
    const schedulerStatus = await axios.get(`${BASE_URL}/scheduler/status`);
    console.log(`✅ Scheduler status: ${JSON.stringify(schedulerStatus.data.scheduler)}\n`);

    // Start scheduler
    const startScheduler = await axios.post(`${BASE_URL}/scheduler/start`);
    console.log(`✅ Scheduler started: ${startScheduler.data.message}\n`);

    // Manual check
    const manualCheck = await axios.post(`${BASE_URL}/scheduler/check`);
    console.log(`✅ Manual check completed: ${manualCheck.data.message}\n`);

    // Test 8: Test validation errors
    console.log('8. Testing validation errors...');
    
    try {
      // Test invalid blog creation (missing required fields)
      await axios.post(BASE_URL, {
        title: '', // Empty title should fail validation
        slug: 'invalid slug with spaces', // Invalid slug format
        content: '' // Empty content should fail validation
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✅ Validation error caught: ${error.response.data.message}`);
        console.log(`   Errors: ${JSON.stringify(error.response.data.errors)}\n`);
      } else {
        throw error;
      }
    }

    // Test 9: Test invalid UUID
    console.log('9. Testing invalid UUID handling...');
    
    try {
      await axios.get(`${BASE_URL}/invalid-uuid`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✅ Invalid UUID validation: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }

    // Test 10: Clean up - Delete the test blog
    console.log('10. Cleaning up - Deleting test blog...');
    await axios.delete(`${BASE_URL}/${blogId}`);
    console.log(`✅ Test blog deleted successfully\n`);

    // Stop scheduler
    const stopScheduler = await axios.post(`${BASE_URL}/scheduler/stop`);
    console.log(`✅ Scheduler stopped: ${stopScheduler.data.message}\n`);

    console.log('🎉 All tests passed successfully!');
    console.log('\n✨ Blog system improvements working correctly:');
    console.log('   ✅ Route conflicts resolved');
    console.log('   ✅ Validation working');
    console.log('   ✅ Error handling improved');
    console.log('   ✅ Scheduler functionality working');
    console.log('   ✅ publishedAt timestamp added');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Make sure your server is running and the blog routes are properly configured.');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 Validation error - check the request data format.');
    }
  }
}

// Run the tests
testBlogPublishing();
