const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  // Only use HTTP-only cookies for security
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ 
      message: 'Access token required',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, username: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    console.log('👤 User found:', { 
      found: !!user, 
      email: user?.email, 
      role: user?.role,
      hasPassword: !!user?.password 
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('❌ User is not admin, role:', user.role);
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Verify password
    console.log('🔑 Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔑 Password verification result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Set JWT as HTTP-only cookie with enhanced security
    res.cookie('admin_token', token, {
      httpOnly: true,                    // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',               // CSRF protection
      maxAge: 24 * 60 * 60 * 1000,     // 24 hours
      path: '/',                        // Explicit path
      domain: process.env.NODE_ENV === 'production' ? '.fitflix.in' : undefined // Subdomain support
    });

    // Return user info (without password)
    res.json({
      message: 'Login successful',
      user: {
        user_id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // Clear cookie with same security settings as login
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.fitflix.in' : undefined
  });
  
  res.json({ 
    message: 'Logout successful',
    code: 'LOGOUT_SUCCESS'
  });
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      user_id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Verify token route
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = { router, authenticateToken, requireAdmin };
