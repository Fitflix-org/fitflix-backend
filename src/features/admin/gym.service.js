const gymRepository = require('./gym.repository');

async function createGym(gymData, amenities = []) { // Default amenities to an empty array
    // This layer can contain more complex business logic in the future,
    // like verifying the amenities exist before calling the repository.
    return await gymRepository.createGym(gymData, amenities);
}

module.exports = { createGym };

/**
 * Orchestrates updating a gym.
 */
async function updateGym(id, gymData, amenities = []) {
    // Business logic: Ensure the gym exists before attempting to update.
    const existingGym = await gymRepository.getGymById(id);
    if (!existingGym) {
        const error = new Error('Gym not found');
        error.statusCode = 404;
        throw error;
    }

    // You could also add logic here to sync amenities if needed,
    // which would call another repository function like syncGymAmenities.
    return await gymRepository.updateGym(id, gymData);
}


async function getAllGyms() {
    return await gymRepository.getAllGyms();
}

async function getGymById(id) {
    return await gymRepository.getGymById(id);
}

module.exports = {
    createGym,
    updateGym,
    getAllGyms,
    getGymById
};