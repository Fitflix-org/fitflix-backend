//src/features/user_profile/user_profile.controller.js
const userProfileService = require('./user_profile.service');

const auth = require('../../middlewares/auth.middleware');

/**
 * Retrieves the user profile for the authenticated user.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming user ID is available from authentication middleware
    const profile = await userProfileService.getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Creates or updates the user profile for the authenticated user.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
const createOrUpdateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming user ID is available from authentication middleware
    const profileData = req.body;

    const updatedProfile = await userProfileService.createOrUpdateUserProfile(userId, profileData);
    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  createOrUpdateUserProfile,
};