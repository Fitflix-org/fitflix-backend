const prisma = require('../../config/db');

/**
 * Retrieves all users from the database, including their profiles.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of user objects.
 * @throws {Error} If a database error occurs during the operation.
 */
async function getAllUsers() {
  try {
    return await prisma.User.findMany({
      include: {
        user_profiles: true,
      },
    });
  } catch (error) {
    console.error('AdminRepository.getAllUsers:', error);
    throw new Error('Database error while fetching users.');
  }
}

module.exports = {
  getAllUsers,
};