const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllGyms(filters = {}) {
    const { city, latitude, longitude, radius } = filters;
    
    let whereClause = {
        is_deleted: false
    };
    
    // Filter by city if provided
    if (city) {
        whereClause.address = {
            contains: city,
            mode: 'insensitive'
        };
    }
    
    const gyms = await prisma.gym.findMany({
        where: whereClause,
        include: {
            gym_amenities: {
                include: {
                    amenity: true
                }
            },
            gym_classes_services: true,
            gym_media: {
                orderBy: {
                    order_index: 'asc'
                }
            },
            membership_plans: {
                where: {
                    is_deleted: false
                },
                orderBy: {
                    price: 'asc'
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
    
    // Calculate distance if user location provided
    if (latitude && longitude && radius) {
        return gyms.filter(gym => {
            const distance = calculateDistance(
                latitude, longitude,
                parseFloat(gym.latitude), parseFloat(gym.longitude)
            );
            return distance <= radius;
        }).map(gym => ({
            ...gym,
            distance: calculateDistance(
                latitude, longitude,
                parseFloat(gym.latitude), parseFloat(gym.longitude)
            )
        }));
    }
    
    return gyms;
}

async function getGymById(id) {
    return await prisma.gym.findUnique({
        where: {
            gym_id: id.toString(),
            is_deleted: false
        },
        include: {
            gym_amenities: {
                include: {
                    amenity: true
                }
            },
            gym_classes_services: true,
            gym_media: {
                orderBy: {
                    order_index: 'asc'
                }
            },
            membership_plans: {
                where: {
                    is_deleted: false
                },
                orderBy: {
                    price: 'asc'
                }
            },
            offers: {
                where: {
                    start_date: {
                        lte: new Date()
                    },
                    end_date: {
                        gte: new Date()
                    }
                }
            }
        }
    });
}

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

module.exports = {
    getAllGyms,
    getGymById
};
