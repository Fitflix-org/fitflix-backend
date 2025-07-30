const gymRepository = require('./gym.repository');

async function getAllGyms(filters = {}) {
    return await gymRepository.getAllGyms(filters);
}

async function getGymById(id) {
    return await gymRepository.getGymById(id);
}

module.exports = {
    getAllGyms,
    getGymById
};
