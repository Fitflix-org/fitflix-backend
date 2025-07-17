const gymRepository = require('./gym.repository');

async function createGym(gymData) {
    // Add any business logic or validation before creating the gym
    return await gymRepository.createGym(gymData);
}

async function updateGym(id, gymData) {
    // Add any business logic or validation before updating the gym
    const existingGym = await gymRepository.getGymById(id);
    if (!existingGym) {
        const error = new Error('Gym not found');
        error.statusCode = 404;
        throw error;
    }
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