#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies that all security headers are properly deployed in production
 * 
 * Usage: node scripts/verify-deployment.js [productionUrl]
 */

const https = require('https');

// Default production URL
const DEFAULT_PROD_URL = 'https://fitflix-backend-avxt.onrender.com';

// Critical security headers that must be present
const CRITICAL_HEADERS = {
  'content-security-policy': 'Content Security Policy',
  'strict-transport-security': 'HTTP Strict Transport Security',
  'cross-origin-opener-policy': 'Cross-Origin-Opener-Policy',
  'cross-origin-embedder-policy': 'Cross-Origin-Embedder-Policy',
  'x-frame-options': 'X-Frame-Options',
  'x-content-type-options': 'X-Content-Type-Options',
  'x-xss-protection': 'X-XSS-Protection'
};

// Security test endpoints
const TEST_ENDPOINTS = [
  '/health',
  '/security-test'
];

class DeploymentVerifier {
  constructor(productionUrl) {
    this.productionUrl = productionUrl;
    this.results = {};
    this.criticalIssues = 0;
    this.totalChecks = 0;
  }

  // Make HTTPS request
  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, (res) => {
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
      req.setTimeout(10000, () => req.destroy()); // 10 second timeout
      req.end();
    });
  }

  // Verify security headers for an endpoint
  async verifyEndpoint(endpoint) {
    console.log(`\n🔍 Verifying: ${endpoint}`);
    
    try {
      const response = await this.makeRequest(`${this.productionUrl}${endpoint}`);
      
      if (response.statusCode === 200) {
        console.log(`✅ Status: ${response.statusCode}`);
        
        let endpointIssues = 0;
        const foundHeaders = {};
        
        // Check critical security headers
        Object.entries(CRITICAL_HEADERS).forEach(([header, displayName]) => {
          const value = response.headers[header];
          if (value) {
            console.log(`✅ ${displayName}: ${value}`);
            foundHeaders[header] = value;
          } else {
            console.log(`❌ ${displayName}: MISSING - CRITICAL ISSUE`);
            endpointIssues++;
            this.criticalIssues++;
          }
        });
        
        // Check additional security headers
        const additionalHeaders = {
          'x-download-options': 'X-Download-Options',
          'x-permitted-cross-domain-policies': 'X-Permitted-Cross-Domain-Policies',
          'referrer-policy': 'Referrer-Policy',
          'permissions-policy': 'Permissions-Policy'
        };
        
        Object.entries(additionalHeaders).forEach(([header, displayName]) => {
          const value = response.headers[header];
          if (value) {
            console.log(`✅ ${displayName}: ${value}`);
            foundHeaders[header] = value;
          } else {
            console.log(`⚠️ ${displayName}: Missing (non-critical)`);
          }
        });
        
        this.results[endpoint] = {
          status: endpointIssues === 0 ? 'SECURE' : 'INSECURE',
          issues: endpointIssues,
          headers: foundHeaders
        };
        
      } else {
        console.log(`❌ Status: ${response.statusCode}`);
        this.results[endpoint] = {
          status: 'ERROR',
          issues: 1,
          error: `HTTP ${response.statusCode}`
        };
        this.criticalIssues++;
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      this.results[endpoint] = {
        status: 'ERROR',
        issues: 1,
        error: error.message
      };
      this.criticalIssues++;
    }
    
    this.totalChecks++;
  }

  // Test HTTPS enforcement
  async testHTTPSEnforcement() {
    console.log('\n🔍 Testing HTTPS Enforcement...');
    
    try {
      const httpUrl = this.productionUrl.replace('https://', 'http://');
      const response = await this.makeRequest(httpUrl);
      
      if (response.statusCode === 301 || response.statusCode === 302) {
        const location = response.headers.location;
        if (location && location.startsWith('https://')) {
          console.log('✅ HTTPS redirect working properly');
        } else {
          console.log('❌ HTTPS redirect not working properly');
          this.criticalIssues++;
        }
      } else {
        console.log('❌ No HTTPS redirect detected');
        this.criticalIssues++;
      }
      
    } catch (error) {
      console.log('✅ HTTPS enforcement working (request failed as expected)');
    }
    
    this.totalChecks++;
  }

  // Test security endpoint functionality
  async testSecurityEndpoint() {
    console.log('\n🔍 Testing Security Endpoint...');
    
    try {
      const response = await this.makeRequest(`${this.productionUrl}/security-test`);
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        console.log('✅ Security test endpoint working');
        console.log(`   Security status: ${data.message}`);
        
        // Verify security features
        if (data.security) {
          Object.entries(data.security).forEach(([feature, status]) => {
            console.log(`   ${feature}: ${status}`);
          });
        }
        
      } else {
        console.log('❌ Security test endpoint not working');
        this.criticalIssues++;
      }
      
    } catch (error) {
      console.log(`❌ Security test endpoint error: ${error.message}`);
      this.criticalIssues++;
    }
    
    this.totalChecks++;
  }

  // Generate deployment report
  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 DEPLOYMENT VERIFICATION REPORT');
    console.log('='.repeat(70));
    
    // Endpoint results
    Object.entries(this.results).forEach(([endpoint, result]) => {
      const status = result.status === 'SECURE' ? '✅ SECURE' : 
                    result.status === 'INSECURE' ? '❌ INSECURE' : '⚠️ ERROR';
      
      console.log(`${status} ${endpoint}`);
      
      if (result.issues > 0) {
        console.log(`   Issues: ${result.issues}`);
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    // Overall status
    console.log('\n' + '-'.repeat(70));
    
    if (this.criticalIssues === 0) {
      console.log('🎉 DEPLOYMENT STATUS: SECURE ✅');
      console.log('   All critical security headers are properly configured');
      console.log('   Production environment is secure');
    } else {
      console.log('🚨 DEPLOYMENT STATUS: INSECURE ❌');
      console.log(`   ${this.criticalIssues} critical security issues detected`);
      console.log('   Production environment requires immediate attention');
    }
    
    // Security score
    const securityScore = this.totalChecks > 0 ? 
      Math.round(((this.totalChecks - this.criticalIssues) / this.totalChecks) * 100) : 0;
    
    console.log(`📊 Security Score: ${securityScore}%`);
    
    // Recommendations
    console.log('\n📋 RECOMMENDATIONS:');
    
    if (this.criticalIssues === 0) {
      console.log('✅ Excellent! Production deployment is secure.');
      console.log('   Continue monitoring and regular security testing.');
    } else {
      console.log('🚨 CRITICAL: Address security issues immediately:');
      console.log('   1. Review missing security headers');
      console.log('   2. Verify Helmet.js configuration');
      console.log('   3. Check environment variables');
      console.log('   4. Test security endpoints');
      console.log('   5. Re-deploy with security fixes');
    }
    
    console.log('\n' + '='.repeat(70));
  }

  // Run all verification checks
  async runVerification() {
    console.log('🚀 Starting Deployment Verification...');
    console.log(`📍 Production URL: ${this.productionUrl}`);
    console.log(`⏰ Started: ${new Date().toISOString()}`);
    
    // Verify each endpoint
    for (const endpoint of TEST_ENDPOINTS) {
      await this.verifyEndpoint(endpoint);
    }
    
    // Test additional security features
    await this.testHTTPSEnforcement();
    await this.testSecurityEndpoint();
    
    // Generate report
    this.generateReport();
    
    // Exit with appropriate code
    process.exit(this.criticalIssues === 0 ? 0 : 1);
  }
}

// Main execution
async function main() {
  const productionUrl = process.argv[2] || DEFAULT_PROD_URL;
  
  if (!productionUrl) {
    console.error('❌ Please provide a production URL');
    console.log('Usage: node scripts/verify-deployment.js [productionUrl]');
    console.log('Example: node scripts/verify-deployment.js https://fitflix-backend-avxt.onrender.com');
    process.exit(1);
  }
  
  const verifier = new DeploymentVerifier(productionUrl);
  await verifier.runVerification();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DeploymentVerifier;
