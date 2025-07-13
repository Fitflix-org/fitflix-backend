// src/features/auth/auth.service.js
// This file contains the core business logic for authentication (login, registration, logout).
// It orchestrates calls to the repository and uses utility functions for hashing/JWT.

require('dotenv').config(); // Ensure environment variables are loaded

const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository'); // Import the repository
const { hashPassword, comparePassword, parseDuration } = require('../../common/helpers'); // Import bcrypt and duration helpers

// Load JWT configurations from .env, with sane defaults
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Handles the user login business logic.
 * @param {string} email - User's email.
 * @param {string} password - User's plain text password.
 * @returns {Promise<{user: object, token: string, expiresInMs: number}>} Object containing sanitized user, JWT, and token expiry.
 * @throws {Error} If credentials are invalid or a server error occurs.
 */
async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  try {
    // 1. Find user by email using the repository
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials.');
    }

    // 2. Compare provided password with hashed password from DB
    const match = await comparePassword(password, user.password_hash);
    if (!match) {
      throw new Error('Invalid credentials.');
    }

    // 3. Sign JWT
    // Ensure the payload structure is consistent with what auth.middleware expects (e.g., req.user.userId, req.user.role)
    const payload = { userId: user.user_id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const expiresInMs = parseDuration(JWT_EXPIRES_IN);

    // 4. Sanitize user object before returning (remove password hash)
    const { password_hash, ...safeUser } = user;

    return {
      user: safeUser,
      token,
      expiresInMs
    };
  } catch (error) {
    // Re-throw specific errors or a generic one for the controller to handle
    if (error.message === 'Invalid credentials.' || error.message === 'Email and password are required.') {
      throw error; // Re-throw known client-facing errors
    }
    console.error('AuthService: Login error:', error);
    throw new Error('Internal server error during login.');
  }
}

/**
 * Handles the user registration business logic.
 * @param {object} userData - User data including email, password, username.
 * @returns {Promise<{user: object, token: string, expiresInMs: number}>} Object containing sanitized new user, JWT, and token expiry.
 * @throws {Error} If required fields are missing, user already exists, or a server error occurs.
 */
async function registerUser(userData) {
  const { email, password, username} = userData;

  // Validate required fields including username
  if (!email || !password || !username) {
    throw new Error('Required fields (email, password, username) are missing.');
  }

  try {
    // 1. Hash the password
    const password_hash = await hashPassword(password); // bcrypt salt rounds are handled internally by hashPassword

    const newUserPayload = {
      email,
      password_hash,
      username,
      role: 'user' // Default role for new registrations
    };

    // 2. Create user in the database using the repository
    // The repository will handle checking for existing email/username due to unique constraints
    const user = await authRepository.createUser(newUserPayload);

    // 3. Sign JWT for the newly registered user
    const payload = { userId: user.user_id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const expiresInMs = parseDuration(JWT_EXPIRES_IN);

    // 4. Sanitize user object before returning
    const { password_hash: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
      expiresInMs
    };
  } catch (error) {
    // Re-throw specific errors from the repository or a generic one
    if (error.message.includes('Required fields (email, password, username, first_name, last_name) are missing.') ||
        error.message.includes('User with this email already exists.') ||
        error.message.includes('Username already taken.')) {
      throw error;
    }
    console.error('AuthService: Register error:', error);
    throw new Error('Internal server error during registration.');
  }
}

/**
 * Handles the user logout business logic.
 * In a stateless JWT setup, logout typically means clearing the client-side token.
 * This function primarily serves to confirm the action from the service layer perspective.
 * @returns {object} A success message.
 */
async function logoutUser() {
  // For JWT, logout is primarily client-side (clearing the cookie/local storage).
  // No server-side database interaction needed for simple JWT invalidation.
  // If using refresh tokens or blacklisting, that logic would go here.
  
  return { message: 'Logout successful.' };
}

module.exports = {
  loginUser,
  registerUser,
  logoutUser
};
