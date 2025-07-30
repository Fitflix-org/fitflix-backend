const nutritionService = require('./nutrition.service');

/**
 * @swagger
 * /nutrition/log:
 *   post:
 *     summary: Log a meal/nutrition entry
 *     tags:
 *       - Nutrition
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meal_type
 *               - food_name
 *               - quantity
 *               - unit
 *             properties:
 *               meal_type:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *               food_name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               calories:
 *                 type: number
 *               protein_g:
 *                 type: number
 *               carbs_g:
 *                 type: number
 *               fat_g:
 *                 type: number
 *               logged_date:
 *                 type: string
 *                 format: date
 *               logged_time:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Nutrition log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/NutritionLog'
 */
async function logNutrition(req, res, next) {
    try {
        const userId = req.user.userId;
        const {
            meal_type,
            food_name,
            quantity,
            unit,
            calories,
            protein_g,
            carbs_g,
            fat_g,
            logged_date,
            logged_time
        } = req.body;
        
        // Validate required fields
        if (!meal_type || !food_name || !quantity || !unit) {
            return res.status(400).json({
                success: false,
                error: 'meal_type, food_name, quantity, and unit are required'
            });
        }
        
        const nutritionLog = await nutritionService.createNutritionLog({
            userId,
            mealType: meal_type,
            foodName: food_name,
            quantity: parseFloat(quantity),
            unit,
            calories: calories ? parseFloat(calories) : null,
            proteinG: protein_g ? parseFloat(protein_g) : null,
            carbsG: carbs_g ? parseFloat(carbs_g) : null,
            fatG: fat_g ? parseFloat(fat_g) : null,
            loggedDate: logged_date ? new Date(logged_date) : new Date(),
            loggedTime: logged_time ? logged_time : new Date().toTimeString().split(' ')[0]
        });
        
        res.status(201).json({
            success: true,
            data: nutritionLog
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /nutrition/daily:
 *   get:
 *     summary: Get daily nutrition logs
 *     tags:
 *       - Nutrition
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for nutrition logs (default today)
 *     responses:
 *       200:
 *         description: Daily nutrition logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NutritionLog'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_calories:
 *                           type: number
 *                         total_protein_g:
 *                           type: number
 *                         total_carbs_g:
 *                           type: number
 *                         total_fat_g:
 *                           type: number
 *                         meal_breakdown:
 *                           type: object
 */
async function getDailyNutrition(req, res, next) {
    try {
        const userId = req.user.userId;
        const { date } = req.query;
        
        const targetDate = date ? new Date(date) : new Date();
        
        const dailyData = await nutritionService.getDailyNutritionLogs(userId, targetDate);
        
        res.status(200).json({
            success: true,
            data: dailyData
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /nutrition/logs/{id}:
 *   put:
 *     summary: Update a nutrition log
 *     tags:
 *       - Nutrition
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               calories:
 *                 type: number
 *               protein_g:
 *                 type: number
 *               carbs_g:
 *                 type: number
 *               fat_g:
 *                 type: number
 *     responses:
 *       200:
 *         description: Nutrition log updated successfully
 */
async function updateNutritionLog(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const updateData = req.body;
        
        const nutritionLog = await nutritionService.updateNutritionLog(id, userId, updateData);
        
        res.status(200).json({
            success: true,
            data: nutritionLog
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /nutrition/logs/{id}:
 *   delete:
 *     summary: Delete a nutrition log
 *     tags:
 *       - Nutrition
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nutrition log deleted successfully
 */
async function deleteNutritionLog(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        
        await nutritionService.deleteNutritionLog(id, userId);
        
        res.status(200).json({
            success: true,
            data: { message: 'Nutrition log deleted successfully' }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    logNutrition,
    getDailyNutrition,
    updateNutritionLog,
    deleteNutritionLog
};
