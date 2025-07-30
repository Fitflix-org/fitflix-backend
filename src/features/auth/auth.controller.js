// src/features/auth/auth.controller.js
// This file handles the HTTP request/response logic for authentication.
// It delegates business logic to the auth.service.js.

const authService = require('./auth.service'); // Import the service layer

/**
 * Handles user login requests.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    // Delegate to the service layer for business logic
    const { user, token, expiresInMs } = await authService.loginUser(email, password);

    // Set HTTP-only cookie with the token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Protect against CSRF
      maxAge: expiresInMs // Cookie expiry matches JWT expiry
    });

    // Respond with sanitized user data
    return res.status(200).json({
      message: 'Login successful.',
      user: user // User object is already sanitized by the service
    });
  } catch (error) {
    // Pass errors to the next middleware for centralized error handling
    next(error);
  }
}

/**
 * Handles user registration requests.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
async function register(req, res, next) {
  // Extract username along with other fields from request body
  const { email, password, username} = req.body;

  try {
    // Delegate to the service layer for business logic
    const { user, token, expiresInMs } = await authService.registerUser({
      email,
      password,
      username, // Pass username to the service
    });

    // Set HTTP-only cookie with the token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresInMs
    });

    // Respond with sanitized new user data
    return res.status(201).json({
      message: 'User registered successfully.',
      user: user // User object is already sanitized by the service
    });
  } catch (error) {
    // Pass errors to the next middleware for centralized error handling
    next(error);
  }
}

/**
 * Handles user logout requests.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
async function logout(req, res, next) {
  try {
    // first, let your authenticate() have run, attached req.user
    // then simply clear the cookie (optional) and return:
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles change password requests.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
async function changePassword(req, res, next) {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    await authService.changePassword(userId, currentPassword, newPassword);
    
    return res.status(200).json({
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles forgot password requests.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
async function forgotPassword(req, res, next) {
  const { email } = req.body;

  try {
    await authService.initiateForgotPassword(email);
    
    return res.status(200).json({
      message: 'Password reset instructions sent to your email.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles reset password requests.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
async function resetPassword(req, res, next) {
  const { token, newPassword } = req.body;

  try {
    await authService.resetPassword(token, newPassword);
    
    return res.status(200).json({
      message: 'Password reset successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles refresh token requests.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
async function refreshToken(req, res, next) {
  const { refreshToken } = req.body;

  try {
    const { user, token, expiresInMs } = await authService.refreshAccessToken(refreshToken);

    // Set new HTTP-only cookie with the token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresInMs
    });

    return res.status(200).json({
      message: 'Token refreshed successfully.',
      user: user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles get current user requests.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await authService.getCurrentUser(userId);
    
    return res.status(200).json({
      message: 'User data retrieved successfully.',
      user: user
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  getCurrentUser
};
