const nutritionRepository = require('./nutrition.repository');

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
    
    return await nutritionRepository.createNutritionLog({
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
    });
}

async function getDailyNutritionLogs(userId, date) {
    const logs = await nutritionRepository.getNutritionLogsByDate(userId, date);
    
    // Calculate summary
    const summary = {
        total_calories: 0,
        total_protein_g: 0,
        total_carbs_g: 0,
        total_fat_g: 0,
        meal_breakdown: {
            breakfast: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, count: 0 },
            lunch: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, count: 0 },
            dinner: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, count: 0 },
            snack: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, count: 0 }
        }
    };
    
    logs.forEach(log => {
        const calories = parseFloat(log.calories) || 0;
        const protein = parseFloat(log.protein_g) || 0;
        const carbs = parseFloat(log.carbs_g) || 0;
        const fat = parseFloat(log.fat_g) || 0;
        
        summary.total_calories += calories;
        summary.total_protein_g += protein;
        summary.total_carbs_g += carbs;
        summary.total_fat_g += fat;
        
        if (summary.meal_breakdown[log.meal_type]) {
            summary.meal_breakdown[log.meal_type].calories += calories;
            summary.meal_breakdown[log.meal_type].protein_g += protein;
            summary.meal_breakdown[log.meal_type].carbs_g += carbs;
            summary.meal_breakdown[log.meal_type].fat_g += fat;
            summary.meal_breakdown[log.meal_type].count += 1;
        }
    });
    
    // Round summary values
    summary.total_calories = Math.round(summary.total_calories * 100) / 100;
    summary.total_protein_g = Math.round(summary.total_protein_g * 100) / 100;
    summary.total_carbs_g = Math.round(summary.total_carbs_g * 100) / 100;
    summary.total_fat_g = Math.round(summary.total_fat_g * 100) / 100;
    
    Object.keys(summary.meal_breakdown).forEach(meal => {
        const breakdown = summary.meal_breakdown[meal];
        breakdown.calories = Math.round(breakdown.calories * 100) / 100;
        breakdown.protein_g = Math.round(breakdown.protein_g * 100) / 100;
        breakdown.carbs_g = Math.round(breakdown.carbs_g * 100) / 100;
        breakdown.fat_g = Math.round(breakdown.fat_g * 100) / 100;
    });
    
    return {
        date: date.toISOString().split('T')[0],
        logs,
        summary
    };
}

async function updateNutritionLog(logId, userId, updateData) {
    // Verify ownership
    const existingLog = await nutritionRepository.getNutritionLogById(logId);
    if (!existingLog || existingLog.user_id !== userId) {
        throw new Error('Nutrition log not found or access denied');
    }
    
    return await nutritionRepository.updateNutritionLog(logId, updateData);
}

async function deleteNutritionLog(logId, userId) {
    // Verify ownership
    const existingLog = await nutritionRepository.getNutritionLogById(logId);
    if (!existingLog || existingLog.user_id !== userId) {
        throw new Error('Nutrition log not found or access denied');
    }
    
    return await nutritionRepository.deleteNutritionLog(logId);
}

module.exports = {
    createNutritionLog,
    getDailyNutritionLogs,
    updateNutritionLog,
    deleteNutritionLog
};
