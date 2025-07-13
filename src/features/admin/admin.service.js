const adminRepository = require('./admin.repository');

/**
 * Retrieves all users from the admin repository.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of user objects.
 * @throws {Error} If an error occurs during the retrieval process.
 */
async function getAllUsers() {
  return await adminRepository.getAllUsers();
}

module.exports = {
  getAllUsers,
};