const userProfileRepository = require('./user_profile.repository');

/**
 * Retrieves a user profile by user ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object|null>} The user profile object if found, otherwise null.
 * @throws {Error} If a database error occurs.
 */
const getUserProfile = async (userId) => {
  try {
    const profile = await userProfileRepository.findProfileByUserId(userId);
    return profile; // Return null if not found, let controller handle 404
  } catch (error) {
    console.error('UserProfileService.getUserProfile:', error);
    throw new Error('Failed to retrieve user profile.');
  }
};

/**
 * Creates or updates a user profile.
 * @param {string} userId - The ID of the user.
 * @param {object} profileData - The data for the user profile.
 * @returns {Promise<object>} The created or updated user profile object.
 * @throws {Error} If a database error occurs.
 */
const createOrUpdateUserProfile = async (userId, profileData) => {

  try {
    let profile = await userProfileRepository.findProfileByUserId(userId);

    if (profile) {
      // Update existing profile
      profile = await userProfileRepository.updateProfile(userId, profileData);
    } else {
      // Create new profile
      profile = await userProfileRepository.createProfile(userId, profileData);
    }
    return profile;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUserProfile,
  createOrUpdateUserProfile,
};