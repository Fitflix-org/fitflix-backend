const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createGym(gymData) {
    return await prisma.gym.create({
        data: gymData,
    });
}

async function updateGym(id, gymData) {
    return await prisma.gym.update({
        where: { gym_id: id.toString() },
        data: gymData,
    });
}

async function getGymById(id) {
    return await prisma.gym.findUnique({
        where: {
            gym_id: id.toString(),
        },
    });
}

async function getAllGyms() {
    return await prisma.gym.findMany({
        include: {
            gym_amenities: true
        }
    });
}

module.exports = {
    createGym,
    updateGym,
    getAllGyms,
    getGymById
};