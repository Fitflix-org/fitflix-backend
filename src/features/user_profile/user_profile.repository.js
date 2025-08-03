// src/features/user_profile/user_profile.repository.js
const prisma = require('../../config/db');
const { NotFoundError, ValidationError } = require('../../common/errors');

/**
 * Finds a user profile by user ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object|null>} The user profile object if found, otherwise null.
 * @throws {Error} If a database error occurs.
 */
const findProfileByUserId = async (userId) => {
  try {
    const userProfile = await prisma.user_profiles.findUnique({
      where: {
        user_id: userId,
      },
    });
    return userProfile;
  } catch (err) {
    console.error('UserProfileRepository.findProfileByUserId:', err.message);
    throw new Error('Database error during user profile lookup.');
  }
};

/**
 * Creates a new user profile.
 * @param {string} userId - The ID of the user for whom the profile is being created.
 * @param {object} profileData - The data for the new user profile.
 * @returns {Promise<object>} The newly created user profile object.
 * @throws {Error} If a database error occurs.
 */
const createProfile = async (userId, profileData) => {
  try {
    const newProfile = await prisma.user_profiles.create({
      data: {
        user_id: userId,
        // Schema-aligned fields with proper defaults
        date_of_birth: profileData.date_of_birth || null,
        height_cm: profileData.height_cm || null,
        weight_kg: profileData.weight_kg || null,
        profile_picture_url: profileData.profile_picture_url || null,
        allergies: profileData.allergies || [],
        dietary_preferences: profileData.dietary_preferences || [],
        primary_fitness_goal: profileData.primary_fitness_goal || null,
        gender: profileData.gender || null,
        // created_at, updated_at, is_deleted, profile_id are auto-generated/defaulted
      },
    });
    return newProfile;
  } catch (err) {
    console.error('UserProfileRepository.createProfile:', err.message);
    throw new Error('Database error during user profile creation.');
  }
};

/**
 * Updates an existing user profile.
 * @param {string} userId - The ID of the user whose profile is being updated.
 * @param {object} profileData - The data to update the user profile with.
 * @returns {Promise<object>} The updated user profile object.
 * @throws {Error} If a database error occurs or the profile is not found.
 */
const updateProfile = async (userId, profileData) => {
  try {
    // Filter out undefined values and only update provided fields
    const updateData = {};
    
    if (profileData.date_of_birth !== undefined) {
      updateData.date_of_birth = new Date (profileData.date_of_birth);
    }
    if (profileData.height_cm !== undefined) {
      updateData.height_cm = profileData.height_cm;
    }
    if (profileData.weight_kg !== undefined) {
      updateData.weight_kg = profileData.weight_kg;
    }
    if (profileData.profile_picture_url !== undefined) {
      updateData.profile_picture_url = profileData.profile_picture_url;
    }
    if (profileData.allergies !== undefined) {
      updateData.allergies = profileData.allergies;
    }
    if (profileData.dietary_preferences !== undefined) {
      updateData.dietary_preferences = profileData.dietary_preferences;
    }
    if (profileData.primary_fitness_goal !== undefined) {
      updateData.primary_fitness_goal = profileData.primary_fitness_goal;
    }
    if (profileData.gender !== undefined) {
      updateData.gender = profileData.gender;
    }
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    const updatedProfile = await prisma.user_profiles.update({
      where: {
        user_id: userId,
      },
      data: updateData,
    });
    return updatedProfile;
  } catch (err) {
    console.error('UserProfileRepository.updateProfile:', err.message);
    if (err.code === 'P2025') {
      throw new NotFoundError('User profile not found.');
    }
    throw new Error('Database error during user profile update.');
  }
};

module.exports = {
  findProfileByUserId,
  createProfile,
  updateProfile,
};