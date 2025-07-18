// src/features/auth/auth.repository.js
const prisma = require('../../config/db');
const userProfileRepository = require('../user_profile/user_profile.repository');

/**
 * Finds a user by their email address.
 * @param {string} email - The email address of the user.
 * @returns {Promise<object|null>} The user object if found, otherwise null.
 * @throws {Error} If a database error occurs.
 */
async function findUserByEmail(email) {
  try {
    return await prisma.User.findUnique({
      where: { email },
      include: { 
        user_profiles: true // This is optional (?) in schema, so it might be null
      }
    });
  } catch (err) {
    console.error('AuthRepository.findUserByEmail:', err);
    throw new Error('Database error during user lookup.');
  }
}

/**
 * Creates a new user and their associated profile.
 * @param {object} userData - The data for the new user.
 * @returns {Promise<object>} The newly created user object with their profile.
 * @throws {Error} If a database error occurs or if the email/username already exists.
 */
async function createUser(userData) {
  try {
    // Create user first
    const user = await prisma.User.create({
      data: {
        email: userData.email,
        password_hash: userData.password_hash,
        username: userData.username,
        role: userData.role || 'user', // Default role as per schema enum
        // created_at and updated_at are auto-generated by schema
        // is_deleted defaults to false as per schema
      }
    });
    
    // Create associated user profile with schema-aligned defaults
    const user_profile = await userProfileRepository.createProfile(user.user_id, {
      // All these fields are optional in schema and can be null
      date_of_birth: null,
      height_cm: null,
      weight_kg: null,
      profile_picture_url: null,
      allergies: [], // Empty array as default
      dietary_preferences: [], // Empty array as default
      primary_fitness_goal: null,
      gender: null,
      // created_at, updated_at, is_deleted are auto-generated/defaulted
    });
    
    return {
      ...user,
      user_profiles: user_profile // Include the created profile
    };
  } catch (err) {
    console.error('AuthRepository.createUser:', err);
    console.log(err);
    
    // Handle Prisma unique constraint violations
    if (err.code === 'P2002') {
      let target = '';
      if (err.meta && err.meta.target) {
        target = Array.isArray(err.meta.target) ? err.meta.target.join(', ') : String(err.meta.target);
      }
      if (target.includes('email')) {
        throw new Error('User with this email already exists.');
      } else if (target.includes('username')) {
        throw new Error('Username already taken.');
      }
    }
    throw new Error('Database error during user creation.');
  }
}

module.exports = {
  findUserByEmail,
  createUser
};