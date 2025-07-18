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


async function createAmenities(amenities) {
    try {
        // The 'name' field must be unique in your schema for skipDuplicates to work on it.
        // If it's not, Prisma will skip based on the primary key, which isn't useful here.
        return await prisma.amenities.createMany({
            data: amenities,
            skipDuplicates: true 
        });
    } catch (error) {
        console.error('Create Amenities Repository Error:', error);
        throw error;
    }
}

async function getAllamenitiesId() {
    try {
        return await prisma.amenities.findMany({
            select: {
                amenity_id: true,
                name: true,
                icon_url: true
            }
        });
    } catch (error) {
        console.error('Get All Amenities Repository Error:', error);
        throw error;
    }
}

module.exports = {
  getAllUsers,
  createAmenities,
  getAllamenitiesId
};