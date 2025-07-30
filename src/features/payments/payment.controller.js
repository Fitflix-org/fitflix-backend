const paymentService = require('./payment.service');

/**
 * @swagger
 * /payments/initialize:
 *   post:
 *     summary: Initialize Razorpay payment order
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in smallest currency unit (paise for INR)
 *               currency:
 *                 type: string
 *                 default: INR
 *               receipt:
 *                 type: string
 *               notes:
 *                 type: object
 *     responses:
 *       201:
 *         description: Payment order created successfully
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
 *                     order_id:
 *                       type: string
 *                     razorpay_order_id:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 */
async function initializePayment(req, res, next) {
    try {
        const userId = req.user.userId;
        const { amount, currency = 'INR', receipt, notes } = req.body;
        
        // Validate required fields
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid amount is required'
            });
        }
        
        const order = await paymentService.createRazorpayOrder({
            userId,
            amount: parseFloat(amount),
            currency,
            receipt,
            notes
        });
        
        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify Razorpay payment
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 */
async function verifyPayment(req, res, next) {
    try {
        const userId = req.user.userId;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                error: 'All Razorpay parameters are required'
            });
        }
        
        const payment = await paymentService.verifyPayment({
            userId,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });
        
        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Razorpay webhook endpoint
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
async function handleWebhook(req, res, next) {
    try {
        const signature = req.get('X-Razorpay-Signature');
        const body = req.body;
        
        if (!signature) {
            return res.status(400).json({
                success: false,
                error: 'Missing signature'
            });
        }
        
        const result = await paymentService.handleWebhook(body, signature);
        
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /users/me/payments:
 *   get:
 *     summary: Get user's payment history
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [success, pending, failed, refunded]
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 */
async function getUserPayments(req, res, next) {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10, status } = req.query;
        
        const payments = await paymentService.getUserPayments({
            userId,
            page: parseInt(page),
            limit: parseInt(limit),
            status
        });
        
        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    initializePayment,
    verifyPayment,
    handleWebhook,
    getUserPayments
};
