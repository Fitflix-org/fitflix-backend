/**
 * Subdomain Redirect Middleware
 * 
 * Handles server-side subdomain redirects for the Fitflix application.
 * When a user visits blogs.fitflix.in, they are automatically redirected to /blogs
 * to load the blogs page directly.
 * 
 * This middleware should be placed early in the middleware stack, before other routes.
 */

const subdomainRedirect = (req, res, next) => {
  // Extract hostname from the request
  const hostname = req.hostname || req.get('host')?.split(':')[0];
  
  // Check if we're on the blogs subdomain
  if (hostname === 'blogs.fitflix.in') {
    // Only redirect if we're on the root path "/"
    if (req.path === '/') {
      if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGS === 'true') {
        console.log(`Subdomain redirect: ${hostname}${req.path} -> /blogs`);
      }
      
      // Perform a 301 permanent redirect to /blogs
      return res.redirect(301, '/blogs');
    }
  }
  
  // Continue to the next middleware if no redirect is needed
  next();
};

module.exports = subdomainRedirect;
