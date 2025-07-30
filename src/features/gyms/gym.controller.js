const gymService = require('./gym.service');

/**
 * @swagger
 * /gyms:
 *   get:
 *     summary: Get all gyms (Public)
 *     tags:
 *       - Gyms
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: User latitude for distance calculation
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: User longitude for distance calculation
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in kilometers (default 10)
 *     responses:
 *       200:
 *         description: List of gyms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Gym'
 *       500:
 *         description: Internal server error
 */
async function getAllGyms(req, res, next) {
    try {
        const { city, latitude, longitude, radius } = req.query;
        const gyms = await gymService.getAllGyms({
            city,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            radius: radius ? parseFloat(radius) : 10
        });
        
        res.status(200).json({
            success: true,
            data: gyms
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /gyms/{id}:
 *   get:
 *     summary: Get a gym by ID (Public)
 *     tags:
 *       - Gyms
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the gym to retrieve
 *     responses:
 *       200:
 *         description: Gym details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GymDetailed'
 *       404:
 *         description: Gym not found
 *       500:
 *         description: Internal server error
 */
async function getGymById(req, res, next) {
    try {
        const { id } = req.params;
        const gym = await gymService.getGymById(id);
        
        if (!gym) {
            return res.status(404).json({
                success: false,
                error: 'Gym not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: gym
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllGyms,
    getGymById
};
