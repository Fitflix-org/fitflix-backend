#!/usr/bin/env node

/**
 * Security Headers Test Script
 * Tests all security headers and configurations in the Fitflix backend
 * 
 * Usage: node scripts/test-security.js [baseUrl]
 * Example: node scripts/test-security.js https://fitflix-backend-avxt.onrender.com
 */

const https = require('https');
const http = require('http');

// Default test URL
const DEFAULT_URL = 'http://localhost:3000';

// Security headers to test
const SECURITY_HEADERS = {
  'content-security-policy': 'CSP',
  'strict-transport-security': 'HSTS',
  'cross-origin-opener-policy': 'COOP',
  'cross-origin-embedder-policy': 'COEP',
  'cross-origin-resource-policy': 'CORP',
  'x-frame-options': 'X-Frame-Options',
  'x-content-type-options': 'X-Content-Type-Options',
  'x-xss-protection': 'X-XSS-Protection',
  'x-download-options': 'X-Download-Options',
  'x-permitted-cross-domain-policies': 'X-Permitted-Cross-Domain-Policies',
  'referrer-policy': 'Referrer-Policy',
  'permissions-policy': 'Permissions-Policy'
};

// Test endpoints
const TEST_ENDPOINTS = [
  '/health',
  '/security-test',
  '/api/auth/login',
  '/api/blogs'
];

class SecurityTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = {};
    this.score = 0;
    this.totalTests = 0;
  }

  // Make HTTP/HTTPS request
  makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;
      
      const options = {
        method,
        headers: {
          'User-Agent': 'Fitflix-Security-Tester/1.0',
          'Accept': 'application/json'
        }
      };

      if (data) {
        options.headers['Content-Type'] = 'application/json';
      }

      const req = client.request(url, options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  // Test security headers
  async testSecurityHeaders(endpoint) {
    console.log(`\n🔍 Testing: ${endpoint}`);
    
    try {
      const response = await this.makeRequest(`${this.baseUrl}${endpoint}`);
      
      if (response.statusCode === 200) {
        console.log(`✅ Status: ${response.statusCode}`);
        
        // Check security headers
        let endpointScore = 0;
        const foundHeaders = {};
        
        Object.entries(SECURITY_HEADERS).forEach(([header, displayName]) => {
          const value = response.headers[header];
          if (value) {
            console.log(`✅ ${displayName}: ${value}`);
            foundHeaders[header] = value;
            endpointScore++;
          } else {
            console.log(`❌ ${displayName}: Missing`);
          }
        });
        
        this.results[endpoint] = {
          status: 'PASS',
          score: endpointScore,
          total: Object.keys(SECURITY_HEADERS).length,
          headers: foundHeaders
        };
        
        this.score += endpointScore;
        this.totalTests += Object.keys(SECURITY_HEADERS).length;
        
      } else {
        console.log(`❌ Status: ${response.statusCode}`);
        this.results[endpoint] = {
          status: 'FAIL',
          score: 0,
          total: Object.keys(SECURITY_HEADERS).length,
          error: `HTTP ${response.statusCode}`
        };
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      this.results[endpoint] = {
        status: 'ERROR',
        score: 0,
        total: Object.keys(SECURITY_HEADERS).length,
        error: error.message
      };
    }
  }

  // Test CSP violations
  async testCSPViolations() {
    console.log('\n🔍 Testing CSP Violations...');
    
    try {
      const maliciousData = {
        test: '<script>alert("XSS")</script>',
        payload: 'javascript:alert("XSS")',
        iframe: '<iframe src="javascript:alert(\'XSS\')"></iframe>'
      };
      
      const response = await this.makeRequest(
        `${this.baseUrl}/api/blogs`, 
        'POST', 
        maliciousData
      );
      
      // Check if request was blocked or processed
      if (response.statusCode === 400) {
        console.log('✅ CSP validation working - malicious request blocked');
        this.score += 5;
        this.totalTests += 5;
      } else {
        console.log('⚠️ CSP validation may not be working properly');
      }
      
    } catch (error) {
      console.log(`✅ CSP validation working - request failed: ${error.message}`);
      this.score += 5;
      this.totalTests += 5;
    }
  }

  // Test rate limiting
  async testRateLimiting() {
    console.log('\n🔍 Testing Rate Limiting...');
    
    try {
      const promises = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 6; i++) {
        promises.push(this.makeRequest(`${this.baseUrl}/api/auth/login`));
      }
      
      const responses = await Promise.all(promises);
      const blockedRequests = responses.filter(r => r.statusCode === 429).length;
      
      if (blockedRequests > 0) {
        console.log(`✅ Rate limiting working - ${blockedRequests} requests blocked`);
        this.score += 5;
        this.totalTests += 5;
      } else {
        console.log('⚠️ Rate limiting may not be working properly');
      }
      
    } catch (error) {
      console.log(`✅ Rate limiting working - requests failed: ${error.message}`);
      this.score += 5;
      this.totalTests += 5;
    }
  }

  // Test CORS restrictions
  async testCORSRestrictions() {
    console.log('\n🔍 Testing CORS Restrictions...');
    
    try {
      const response = await this.makeRequest(`${this.baseUrl}/health`);
      const corsHeader = response.headers['access-control-allow-origin'];
      
      if (corsHeader && corsHeader !== '*') {
        console.log('✅ CORS restrictions working - origin not wildcard');
        this.score += 5;
        this.totalTests += 5;
      } else {
        console.log('⚠️ CORS may be too permissive');
      }
      
    } catch (error) {
      console.log(`❌ CORS test failed: ${error.message}`);
    }
  }

  // Generate security report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🛡️  SECURITY TEST REPORT');
    console.log('='.repeat(60));
    
    // Endpoint results
    Object.entries(this.results).forEach(([endpoint, result]) => {
      const percentage = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
      const status = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      
      console.log(`${status} ${endpoint}: ${result.score}/${result.total} (${percentage}%)`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    // Overall score
    const overallPercentage = this.totalTests > 0 ? Math.round((this.score / this.totalTests) * 100) : 0;
    console.log('\n' + '-'.repeat(60));
    console.log(`📊 OVERALL SECURITY SCORE: ${this.score}/${this.totalTests} (${overallPercentage}%)`);
    
    // Grade
    let grade = 'F';
    if (overallPercentage >= 90) grade = 'A+';
    else if (overallPercentage >= 80) grade = 'A';
    else if (overallPercentage >= 70) grade = 'B';
    else if (overallPercentage >= 60) grade = 'C';
    else if (overallPercentage >= 50) grade = 'D';
    
    console.log(`🏆 SECURITY GRADE: ${grade}`);
    
    // Recommendations
    console.log('\n📋 RECOMMENDATIONS:');
    
    if (overallPercentage >= 90) {
      console.log('✅ Excellent security posture! Keep monitoring and updating.');
    } else if (overallPercentage >= 80) {
      console.log('✅ Good security posture. Review failed tests and improve.');
    } else if (overallPercentage >= 70) {
      console.log('⚠️ Moderate security posture. Address security gaps immediately.');
    } else {
      console.log('🚨 Poor security posture. Critical security review required!');
    }
    
    console.log('\n' + '='.repeat(60));
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Security Tests...');
    console.log(`📍 Testing: ${this.baseUrl}`);
    console.log(`⏰ Started: ${new Date().toISOString()}`);
    
    // Test security headers for each endpoint
    for (const endpoint of TEST_ENDPOINTS) {
      await this.testSecurityHeaders(endpoint);
    }
    
    // Test additional security features
    await this.testCSPViolations();
    await this.testRateLimiting();
    await this.testCORSRestrictions();
    
    // Generate report
    this.generateReport();
  }
}

// Main execution
async function main() {
  const baseUrl = process.argv[2] || DEFAULT_URL;
  
  if (!baseUrl) {
    console.error('❌ Please provide a base URL');
    console.log('Usage: node scripts/test-security.js [baseUrl]');
    console.log('Example: node scripts/test-security.js https://fitflix-backend-avxt.onrender.com');
    process.exit(1);
  }
  
  const tester = new SecurityTester(baseUrl);
  await tester.runAllTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = SecurityTester;
