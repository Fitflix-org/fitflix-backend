const adminRepository = require('./admin.repository');

/**
 * Retrieves all users from the admin repository.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of user objects.
 * @throws {Error} If an error occurs during the retrieval process.
 */
async function getAllUsers() {
  return await adminRepository.getAllUsers();
}

async function createAmenities(amenities) {
    if (!amenities || amenities.length === 0) {
        const error = new Error('No amenities provided.');
        error.statusCode = 400;
        throw error;
    }
    return await adminRepository.createAmenities(amenities);
}

async function getAllamenitiesId() {
    return await adminRepository.getAllamenitiesId();
}
module.exports = {
  getAllUsers,
  createAmenities,
  getAllamenitiesId
};