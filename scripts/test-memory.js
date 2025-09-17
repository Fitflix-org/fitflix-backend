#!/usr/bin/env node

/**
 * Memory usage test for FitFlix Backend
 * Tests if the backend can run within 512MB RAM limit
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing FitFlix Backend Memory Usage');
console.log('=' .repeat(50));

const testMemoryUsage = () => {
  return new Promise((resolve, reject) => {
    // Set memory-optimized environment
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      MAX_MEMORY_MB: '512',
      ENABLE_CLUSTERING: 'false',
      NODE_OPTIONS: '--max-old-space-size=400 --optimize-for-size --expose-gc',
      UV_THREADPOOL_SIZE: '2',
      PORT: '3001', // Different port for testing
      DEBUG_LOGS: 'true',
    };

    // Start the server
    const serverProcess = spawn('node', ['-r', 'dotenv/config', 'server.js', 'dotenv_config_path=.env'], {
      env,
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let memoryUsage = [];
    let serverStarted = false;

    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text.trim());

      // Check if server started
      if (text.includes('FitFlix Backend Server running')) {
        serverStarted = true;
        console.log('✅ Server started successfully');
        
        // Monitor memory usage for 30 seconds
        const memoryMonitor = setInterval(() => {
          const usage = process.memoryUsage();
          const rss = Math.round(usage.rss / 1024 / 1024);
          const heapUsed = Math.round(usage.heapUsed / 1024 / 1024);
          
          memoryUsage.push({ rss, heapUsed, timestamp: new Date() });
          console.log(`📊 Memory: ${rss}MB RSS, ${heapUsed}MB Heap`);
          
          // Check if memory limit exceeded
          if (rss > 512) {
            console.error(`🚨 MEMORY LIMIT EXCEEDED: ${rss}MB > 512MB`);
            clearInterval(memoryMonitor);
            serverProcess.kill();
            reject(new Error(`Memory limit exceeded: ${rss}MB`));
            return;
          }
          
          // Test completed successfully after 30 seconds
          if (memoryUsage.length >= 6) { // 6 measurements (30 seconds)
            clearInterval(memoryMonitor);
            serverProcess.kill();
            
            const maxMemory = Math.max(...memoryUsage.map(m => m.rss));
            const avgMemory = Math.round(memoryUsage.reduce((a, b) => a + b.rss, 0) / memoryUsage.length);
            
            console.log('\n🎉 Memory Test Results:');
            console.log(`   Max Memory: ${maxMemory}MB`);
            console.log(`   Avg Memory: ${avgMemory}MB`);
            console.log(`   Memory Limit: 512MB`);
            console.log(`   Status: ${maxMemory <= 512 ? '✅ PASSED' : '❌ FAILED'}`);
            
            resolve({
              success: maxMemory <= 512,
              maxMemory,
              avgMemory,
              measurements: memoryUsage
            });
          }
        }, 5000); // Check every 5 seconds
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('❌ Error:', data.toString());
    });

    serverProcess.on('close', (code) => {
      if (!serverStarted) {
        reject(new Error(`Server failed to start. Exit code: ${code}`));
      }
    });

    // Timeout after 2 minutes
    setTimeout(() => {
      if (serverProcess.pid) {
        serverProcess.kill();
      }
      reject(new Error('Test timeout - server took too long to start'));
    }, 120000);
  });
};

// Run the test
const runTest = async () => {
  try {
    console.log('🚀 Starting memory usage test...\n');
    const results = await testMemoryUsage();
    
    console.log('\n' + '=' .repeat(50));
    if (results.success) {
      console.log('🎉 TEST PASSED: Backend runs within 512MB limit');
      console.log(`📊 Peak Memory Usage: ${results.maxMemory}MB / 512MB`);
      process.exit(0);
    } else {
      console.log('❌ TEST FAILED: Backend exceeds 512MB limit');
      console.log(`📊 Peak Memory Usage: ${results.maxMemory}MB / 512MB`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  runTest();
}

module.exports = { testMemoryUsage };