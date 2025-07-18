const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createGym(gymData, amenityIds = []) {
    try {
        const dataToCreate = { ...gymData };

        // Check if there are any amenity IDs to connect
        if (amenityIds && amenityIds.length > 0) {
            // Use the correct relation name: 'gym_amenities'
            dataToCreate.gym_amenities = {
                create: amenityIds.map(id => ({
                    // Connect to an existing amenity using its ID
                    amenity: {
                        connect: {
                            amenity_id: id
                        }
                    }
                }))
            };
        }

        // Now, create the gym. If amenityIds was empty, the gym_amenities field will not be included.
        return await prisma.gym.create({
            data: dataToCreate,
            include: {
                // Include the full amenity details in the response for verification
                gym_amenities: {
                    include: {
                        amenity: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Create Gym Repository Error:', error);
        throw error;
    }
}

async function updateGym(id, gymData) {
    return await prisma.gym.update({
        where: { gym_id: id },
        data: gymData,
    });
}

async function getAllGyms() {
    return await prisma.gym.findMany({
        include: {
            gym_amenities: true
        }
    });
}

async function getGymById(id) {
    return await prisma.gym.findUnique({
        where: { gym_id: id },
        include: {
            gym_amenities: {
                include: {
                    amenity: true
                }
            }
        }
    });
}

async function getAllGyms() {
    return await prisma.gym.findMany({
        include: {
            gym_amenities: {
                include: {
                    amenity: true 
                }
            }
        }
    });
}

module.exports = {
    createGym,
    updateGym,
    getAllGyms,
    getGymById
};