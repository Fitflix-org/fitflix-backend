const adminService = require('./admin.service');
const gymService = require('./gym.service');

/**
 * Handles the request to get all users.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
async function getAllUsers(req, res, next) {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

/**
 * Handles the request to get all users.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
async function getAllGyms(req, res, next) {
    try {
        const gyms = await gymService.getAllGyms();
        res.json(gyms);
    } catch (error) {
        next(error);
    }
}

module.exports = {
  getAllUsers,
  getAllGyms,
};