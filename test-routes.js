const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/blogs';

async function testRoutes() {
  try {
    console.log('🧪 Testing Route Ordering...\n');

    // Test 1: Get all blogs
    console.log('1. Testing GET /api/blogs');
    try {
      const response = await axios.get(BASE_URL);
      console.log(`✅ Success: ${response.data.blogs.length} blogs found\n`);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 2: Test scheduler status
    console.log('2. Testing GET /api/blogs/scheduler/status');
    try {
      const response = await axios.get(`${BASE_URL}/scheduler/status`);
      console.log(`✅ Success: Scheduler status retrieved\n`);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 3: Test status route
    console.log('3. Testing GET /api/blogs/status/DRAFT');
    try {
      const response = await axios.get(`${BASE_URL}/status/DRAFT`);
      console.log(`✅ Success: ${response.data.blogs.length} draft blogs found\n`);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 4: Test slug route
    console.log('4. Testing GET /api/blogs/slug/getting-started-with-fitness');
    try {
      const response = await axios.get(`${BASE_URL}/slug/getting-started-with-fitness`);
      console.log(`✅ Success: Blog found with title "${response.data.blog.title}"\n`);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 5: Test ID route with invalid UUID
    console.log('5. Testing GET /api/blogs/1 (should fail validation)');
    try {
      const response = await axios.get(`${BASE_URL}/1`);
      console.log(`❌ Unexpected success: ${response.data.message}\n`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✅ Expected validation error: ${error.response.data.message}\n`);
      } else {
        console.log(`❌ Unexpected error: ${error.response?.data?.message || error.message}\n`);
      }
    }

    // Test 6: Test ID route with valid UUID format
    console.log('6. Testing GET /api/blogs/00000000-0000-0000-0000-000000000000 (should fail not found)');
    try {
      const response = await axios.get(`${BASE_URL}/00000000-0000-0000-0000-000000000000`);
      console.log(`❌ Unexpected success: ${response.data.message}\n`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`✅ Expected not found error: ${error.response.data.message}\n`);
      } else {
        console.log(`❌ Unexpected error: ${error.response?.data?.message || error.message}\n`);
      }
    }

    console.log('🎉 Route testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testRoutes();
