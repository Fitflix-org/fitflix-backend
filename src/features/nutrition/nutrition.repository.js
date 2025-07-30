const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createNutritionLog(data) {
    const {
        userId,
        mealType,
        foodName,
        quantity,
        unit,
        calories,
        proteinG,
        carbsG,
        fatG,
        loggedDate,
        loggedTime
    } = data;
    
    return await prisma.nutrition_logs.create({
        data: {
            user_id: userId,
            meal_type: mealType,
            food_name: foodName,
            quantity,
            unit,
            calories,
            protein_g: proteinG,
            carbs_g: carbsG,
            fat_g: fatG,
            logged_date: loggedDate,
            logged_time: loggedTime
        }
    });
}

async function getNutritionLogsByDate(userId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await prisma.nutrition_logs.findMany({
        where: {
            user_id: userId,
            logged_date: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        orderBy: [
            { logged_date: 'asc' },
            { logged_time: 'asc' }
        ]
    });
}

async function getNutritionLogById(logId) {
    return await prisma.nutrition_logs.findUnique({
        where: {
            log_id: logId
        }
    });
}

async function updateNutritionLog(logId, updateData) {
    return await prisma.nutrition_logs.update({
        where: {
            log_id: logId
        },
        data: updateData
    });
}

async function deleteNutritionLog(logId) {
    return await prisma.nutrition_logs.delete({
        where: {
            log_id: logId
        }
    });
}

async function getNutritionLogsByDateRange(userId, startDate, endDate) {
    return await prisma.nutrition_logs.findMany({
        where: {
            user_id: userId,
            logged_date: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: [
            { logged_date: 'desc' },
            { logged_time: 'desc' }
        ]
    });
}

module.exports = {
    createNutritionLog,
    getNutritionLogsByDate,
    getNutritionLogById,
    updateNutritionLog,
    deleteNutritionLog,
    getNutritionLogsByDateRange
};
