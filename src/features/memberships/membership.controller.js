const membershipService = require('./membership.service');

/**
 * @swagger
 * /memberships:
 *   get:
 *     summary: Get all membership plans
 *     tags:
 *       - Memberships
 *     parameters:
 *       - in: query
 *         name: gym_id
 *         schema:
 *           type: string
 *         description: Filter by gym ID
 *     responses:
 *       200:
 *         description: Membership plans retrieved successfully
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
 *                     $ref: '#/components/schemas/MembershipPlan'
 */
async function getAllMembershipPlans(req, res, next) {
    try {
        const { gym_id } = req.query;
        const plans = await membershipService.getAllMembershipPlans(gym_id);
        
        res.status(200).json({
            success: true,
            data: plans
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /users/me/memberships:
 *   get:
 *     summary: Get user's current memberships
 *     tags:
 *       - User Memberships
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User memberships retrieved successfully
 */
async function getUserMemberships(req, res, next) {
    try {
        const userId = req.user.userId;
        const memberships = await membershipService.getUserMemberships(userId);
        
        res.status(200).json({
            success: true,
            data: memberships
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /users/me/memberships:
 *   post:
 *     summary: Subscribe to a membership plan
 *     tags:
 *       - User Memberships
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan_id
 *             properties:
 *               plan_id:
 *                 type: string
 *               payment_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Membership created successfully
 */
async function createUserMembership(req, res, next) {
    try {
        const userId = req.user.userId;
        const { plan_id, payment_id } = req.body;
        
        const membership = await membershipService.createUserMembership({
            userId,
            planId: plan_id,
            paymentId: payment_id
        });
        
        res.status(201).json({
            success: true,
            data: membership
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /users/me/memberships/{id}:
 *   put:
 *     summary: Update membership (cancel/renew)
 *     tags:
 *       - User Memberships
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
 *               action:
 *                 type: string
 *                 enum: [cancel, renew]
 *               auto_renewal_enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Membership updated successfully
 */
async function updateUserMembership(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { action, auto_renewal_enabled } = req.body;
        
        const membership = await membershipService.updateUserMembership({
            userId,
            membershipId: id,
            action,
            autoRenewalEnabled: auto_renewal_enabled
        });
        
        res.status(200).json({
            success: true,
            data: membership
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllMembershipPlans,
    getUserMemberships,
    createUserMembership,
    updateUserMembership
};
