// src/common/helpers.js
// This file contains general utility functions used across different parts of the application.

const bcrypt = require('bcryptjs'); // Using bcryptjs as per your original controller

/**
 * Hashes a plain text password.
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} The hashed password.
 */
async function hashPassword(password) {
  const saltRounds = 10; // Recommended salt rounds for bcrypt
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hashed password.
 * @param {string} password - The plain text password.
 * @param {string} hashedPassword - The hashed password from the database.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Helper: Converts duration strings (e.g., '1d', '2h', '30m') to milliseconds.
 * Defaults to 1 day if format is invalid.
 * @param {string} msString - Duration string.
 * @returns {number} Duration in milliseconds.
 */
function parseDuration(msString) {
  const m = msString.match(/^(\d+)([smhd])$/);
  if (!m) return 24 * 3600 * 1000; // Default to 1 day if format is invalid

  const [_, val, unit] = m;
  const v = parseInt(val, 10);
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 3600 * 1000,
    d: 24 * 3600 * 1000
  };
  return v * (multipliers[unit] || multipliers.d);
}

module.exports = {
  hashPassword,
  comparePassword,
  parseDuration
};