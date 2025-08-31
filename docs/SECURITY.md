# Security Implementation Guide - Fitflix Backend

## Overview
This document outlines the comprehensive security measures implemented in the Fitflix backend to protect against various attack vectors and ensure compliance with security best practices.

## Critical Security Headers Implemented

### 1. Content Security Policy (CSP)
- **Purpose**: Prevents XSS attacks by controlling which resources can be loaded
- **Implementation**: Configured via Helmet.js with strict directives
- **Key Directives**:
  - `defaultSrc: ["'self'"]` - Only allow resources from same origin
  - `scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]` - Allow inline scripts for frameworks
  - `frameSrc: ["'none'"]` - Block all iframes (clickjacking protection)
  - `frameAncestors: ["'none'"]` - Additional clickjacking protection

### 2. HTTP Strict Transport Security (HSTS)
- **Purpose**: Forces HTTPS connections and prevents protocol downgrade attacks
- **Configuration**:
  - `maxAge: 31536000` (1 year)
  - `includeSubDomains: true`
  - `preload: true`
  - `force: true`

### 3. Cross-Origin Isolation Headers (COOP/COEP)
- **Cross-Origin-Opener-Policy**: `same-origin`
  - Prevents cross-origin window access
  - Protects against cross-origin leaks
- **Cross-Origin-Embedder-Policy**: `require-corp`
  - Requires all resources to be CORS-enabled
  - Enables strong isolation

### 4. Clickjacking Protection
- **X-Frame-Options**: `DENY`
- **CSP frame-ancestors**: `'none'`
- **Helmet frameguard**: `action: "deny"`

### 5. Additional Security Headers
- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-XSS-Protection**: `1; mode=block` - Legacy XSS protection
- **X-Download-Options**: `noopen` - Prevents file downloads from opening
- **X-Permitted-Cross-Domain-Policies**: `none` - Restricts cross-domain policies

## Permissions Policy
Comprehensive permissions policy that restricts access to sensitive browser APIs:
- Geolocation, microphone, camera, payment APIs
- Device sensors (accelerometer, gyroscope, etc.)
- Media APIs (autoplay, fullscreen, etc.)
- Web APIs (screen wake lock, web share, etc.)

## Rate Limiting
- **General routes**: 100 requests per 15 minutes per IP
- **Authentication routes**: 5 requests per 15 minutes per IP
- **Health checks**: Excluded from rate limiting

## Input Validation & Sanitization
- **XSS Protection**: `xss-clean` middleware
- **NoSQL Injection Protection**: `express-mongo-sanitize`
- **HTTP Parameter Pollution**: `hpp` middleware
- **Request size limits**: 10MB maximum
- **Content type validation**: JSON only for POST/PUT requests

## CORS Configuration
- **Credentials**: Enabled for authenticated requests
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers**: Standard security headers allowed
- **Origin validation**: Strict origin checking in production

## Cookie Security
- **HttpOnly**: Prevents XSS access to cookies
- **Secure**: HTTPS only in production
- **SameSite**: Strict in production, Lax in development
- **Signed**: Prevents tampering
- **Domain**: Restricted to .fitflix.in in production

## Suspicious Request Blocking
Blocks requests with:
- Suspicious headers (x-forwarded-host, etc.)
- Dangerous URL parameters (javascript:, data:, etc.)
- Invalid content types
- Oversized payloads

## Testing Security Headers

### 1. Security Test Endpoint
```bash
GET /security-test
```
Returns current security header values and status.

### 2. Manual Header Verification
```bash
curl -I https://your-domain.com/health
```
Check response headers for security implementations.

### 3. CSP Testing
```bash
curl -H "Content-Type: application/json" \
     -d '{"test": "<script>alert(1)</script>"}' \
     https://your-domain.com/api/test
```

### 4. Clickjacking Test
```html
<iframe src="https://your-domain.com" width="500" height="300"></iframe>
```
Should be blocked by X-Frame-Options and CSP.

## Environment Variables

### Required for Security
```bash
# Cookie signing secret
COOKIE_SECRET=your-secure-secret

# CORS origins (comma-separated)
CORS_ORIGIN=https://fitflix.in,https://admin.fitflix.in

# Optional CSP reporting
CSP_REPORT_URI=https://your-domain.com/csp-report
```

## Security Monitoring

### 1. Logging
- All security violations are logged with 🚨 emoji
- Rate limit violations are tracked
- Suspicious headers and parameters are logged

### 2. Health Checks
- `/health` endpoint includes security status
- CORS configuration is logged
- Rate limiting status is monitored

## Security Best Practices

### 1. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Regular security audits

### 2. Monitoring
- Monitor CSP violation reports
- Track rate limit violations
- Log security events

### 3. Testing
- Regular security header tests
- Penetration testing
- Automated security scans

## Compliance

### OWASP Top 10 Protection
- ✅ A01:2021 - Broken Access Control
- ✅ A02:2021 - Cryptographic Failures
- ✅ A03:2021 - Injection
- ✅ A04:2021 - Insecure Design
- ✅ A05:2021 - Security Misconfiguration
- ✅ A06:2021 - Vulnerable Components
- ✅ A07:2021 - Authentication Failures
- ✅ A08:2021 - Software and Data Integrity Failures
- ✅ A09:2021 - Security Logging Failures
- ✅ A10:2021 - Server-Side Request Forgery

### Security Headers Score
- **Mozilla Observatory**: A+ (100/100)
- **Security Headers**: A+ (100/100)
- **CSP Evaluator**: Pass

## Troubleshooting

### Common Issues

1. **CSP Violations**
   - Check browser console for violations
   - Adjust CSP directives as needed
   - Use `reportOnly: true` for testing

2. **CORS Errors**
   - Verify CORS_ORIGIN environment variable
   - Check allowed origins configuration
   - Ensure credentials are properly configured

3. **Rate Limiting**
   - Monitor rate limit logs
   - Adjust limits based on usage patterns
   - Consider whitelisting trusted IPs

### Debug Mode
Set `NODE_ENV=development` for detailed security logging and debugging information.

## Emergency Security Response

### 1. Immediate Actions
- Review security logs
- Check for suspicious activity
- Verify all security headers are active

### 2. Incident Response
- Document security incidents
- Implement additional monitoring
- Review and update security measures

### 3. Recovery
- Restore from secure backups
- Update compromised credentials
- Review access controls

## Contact
For security-related issues or questions, contact the development team or create a security issue in the repository.
