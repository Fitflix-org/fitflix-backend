// src/features/auth/auth.service.js
// This file contains the core business logic for authentication (login, registration, logout).
// It orchestrates calls to the repository and uses utility functions for hashing/JWT.

require('dotenv').config(); // Ensure environment variables are loaded

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authRepository = require('./auth.repository'); // Import the repository
const { hashPassword, comparePassword, parseDuration } = require('../../common/helpers'); // Import bcrypt and duration helpers
const { ConflictError, ValidationError } = require('../../common/errors');

// Load JWT configurations from .env, with sane defaults
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

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
    // Re-throw specific errors from the repository
    if (error instanceof ConflictError ||
        error instanceof ValidationError ||
        error.message.includes('Required fields') ||
        error.message.includes('User with this email already exists') ||
        error.message.includes('Username already taken')) {
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

/**
 * Changes user password.
 * @param {number} userId - User ID.
 * @param {string} currentPassword - Current password.
 * @param {string} newPassword - New password.
 * @throws {Error} If current password is invalid or server error occurs.
 */
async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new Error('Current password and new password are required.');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  try {
    // Get user by ID
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    // Verify current password
    const match = await comparePassword(currentPassword, user.password_hash);
    if (!match) {
      throw new Error('Current password is incorrect.');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database
    await authRepository.updateUserPassword(userId, newPasswordHash);

    return { message: 'Password changed successfully.' };
  } catch (error) {
    if (error.message.includes('Current password is incorrect') ||
        error.message.includes('New password must be at least') ||
        error.message.includes('Current password and new password are required')) {
      throw error;
    }
    console.error('AuthService: Change password error:', error);
    throw new Error('Internal server error during password change.');
  }
}

/**
 * Initiates forgot password process.
 * @param {string} email - User email.
 */
async function initiateForgotPassword(email) {
  if (!email) {
    throw new Error('Email is required.');
  }

  try {
    // Check if user exists
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'Password reset instructions sent to your email.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token in database
    await authRepository.createPasswordResetToken({
      userId: user.user_id,
      token: resetToken,
      expiresAt
    });

    // In production, send email with reset link
    // For now, just log the token (remove in production)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { message: 'Password reset instructions sent to your email.' };
  } catch (error) {
    console.error('AuthService: Forgot password error:', error);
    throw new Error('Internal server error during password reset initiation.');
  }
}

/**
 * Resets user password using reset token.
 * @param {string} token - Reset token.
 * @param {string} newPassword - New password.
 */
async function resetPassword(token, newPassword) {
  if (!token || !newPassword) {
    throw new Error('Reset token and new password are required.');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  try {
    // Find valid reset token
    const resetRecord = await authRepository.findPasswordResetToken(token);
    if (!resetRecord || resetRecord.expires_at < new Date()) {
      throw new Error('Invalid or expired reset token.');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update user password
    await authRepository.updateUserPassword(resetRecord.user_id, newPasswordHash);

    // Delete used reset token
    await authRepository.deletePasswordResetToken(token);

    return { message: 'Password reset successfully.' };
  } catch (error) {
    if (error.message.includes('Invalid or expired reset token') ||
        error.message.includes('New password must be at least') ||
        error.message.includes('Reset token and new password are required')) {
      throw error;
    }
    console.error('AuthService: Reset password error:', error);
    throw new Error('Internal server error during password reset.');
  }
}

/**
 * Refreshes access token using refresh token.
 * @param {string} refreshToken - Refresh token.
 * @returns {Promise<{user: object, token: string, expiresInMs: number}>} New access token and user data.
 */
async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new Error('Refresh token is required.');
  }

  try {
    // Find valid refresh token
    const tokenRecord = await authRepository.findRefreshToken(refreshToken);
    if (!tokenRecord || tokenRecord.expires_at < new Date()) {
      throw new Error('Invalid or expired refresh token.');
    }

    // Get user data
    const user = await authRepository.findUserById(tokenRecord.user_id);
    if (!user) {
      throw new Error('User not found.');
    }

    // Generate new access token
    const payload = { userId: user.user_id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const expiresInMs = parseDuration(JWT_EXPIRES_IN);

    // Sanitize user object
    const { password_hash, ...safeUser } = user;

    return {
      user: safeUser,
      token,
      expiresInMs
    };
  } catch (error) {
    if (error.message.includes('Invalid or expired refresh token') ||
        error.message.includes('Refresh token is required')) {
      throw error;
    }
    console.error('AuthService: Refresh token error:', error);
    throw new Error('Internal server error during token refresh.');
  }
}

/**
 * Gets current user data.
 * @param {number} userId - User ID.
 * @returns {Promise<object>} Sanitized user data.
 */
async function getCurrentUser(userId) {
  try {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    // Sanitize user object
    const { password_hash, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    if (error.message.includes('User not found')) {
      throw error;
    }
    console.error('AuthService: Get current user error:', error);
    throw new Error('Internal server error retrieving user data.');
  }
}

/**
 * Creates refresh token for user.
 * @param {number} userId - User ID.
 * @returns {Promise<string>} Refresh token.
 */
async function createRefreshToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + parseDuration(REFRESH_TOKEN_EXPIRES_IN));

  await authRepository.createRefreshToken({
    userId,
    token,
    expiresAt
  });

  return token;
}

module.exports = {
  loginUser,
  registerUser,
  logoutUser,
  changePassword,
  initiateForgotPassword,
  resetPassword,
  refreshAccessToken,
  getCurrentUser,
  createRefreshToken
};
