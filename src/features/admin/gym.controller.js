const gymService = require('./gym.service');

/**
 * @swagger
 * /admin/gyms:
 *   post:
 *     summary: Create a new gym
 *     tags:
 *       - Admin - Gyms
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - latitude
 *               - longitude
 *               - opening_time
 *               - closing_time
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *               opening_time:
 *                 type: string
 *                 format: date-time
 *               closing_time:
 *                 type: string
 *                 format: date-time
 *               holiday_dates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gym created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */




async function createGym(req, res, next) {
    try {
        // 1. Separate the amenities array from the rest of the gym data
        const { amenities, ...gymData } = req.body;

        // 2. Convert time strings to Date objects (your existing logic is correct)
        if (gymData.opening_time && typeof gymData.opening_time === 'string') {
            gymData.opening_time = new Date(gymData.opening_time);
        }
        if (gymData.closing_time && typeof gymData.closing_time === 'string') {
            gymData.closing_time = new Date(gymData.closing_time);
        }
        if (gymData.holiday_dates && Array.isArray(gymData.holiday_dates)) {
            gymData.holiday_dates = gymData.holiday_dates.map(date => new Date(date));
        }
        
        // 3. Pass both the gym data and the amenities array to the service
        const newGym = await gymService.createGym(gymData, amenities);
        res.status(201).json(newGym);
    } catch (error) {
        if (error.name === 'PrismaClientValidationError') {
            console.error("Prisma Validation Error:", error.message);
        }
        next(error);
    }
}

module.exports = { createGym };


/**
 * @swagger
 * /admin/gyms/{id}:
 *   put:
 *     summary: Update an existing gym
 *     tags:
 *       - Admin - Gyms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the gym to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *               opening_time:
 *                 type: string
 *                 format: date-time
 *               closing_time:
 *                 type: string
 *                 format: date-time
 *               holiday_dates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gym updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Gym not found
 */
async function updateGym(req, res, next) {
    try {
        const { id } = req.params;
        const gymData = { ...req.body };

        if (gymData.holiday_dates) {
            gymData.holiday_dates = gymData.holiday_dates.map(date => new Date(date));
        }

        if (gymData.opening_time && typeof gymData.opening_time === 'string') {
            gymData.opening_time = formatTimeString(gymData.opening_time);
        }

        if (gymData.closing_time && typeof gymData.closing_time === 'string') {
            gymData.closing_time = formatTimeString(gymData.closing_time);
        }

        const updatedGym = await gymService.updateGym(id, gymData, amenities || []);
        res.status(200).json(updatedGym);
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /admin/gyms:
 *   get:
 *     summary: Get all gyms
 *     tags:
 *       - Admin - Gyms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all gyms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gym'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
async function getAllGyms(req, res, next) {
    try {
        const gyms = await gymService.getAllGyms();
        res.status(200).json(gyms);
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /admin/gyms/{id}:
 *   get:
 *     summary: Get a gym by ID
 *     tags:
 *       - Admin - Gyms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the gym to retrieve
 *     responses:
 *       200:
 *         description: Gym details
 *       404:
 *         description: Gym not found
 */
async function getGymById(req, res, next) {
    try {
        const { id } = req.params;
        const gym = await gymService.getGymById(id);
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }
        res.status(200).json(gym);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createGym,
    updateGym,
    getAllGyms,
    getGymById
};