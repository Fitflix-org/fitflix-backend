const chatbotService = require('./chatbot.service');

/**
 * @swagger
 * /chatbot:
 *   post:
 *     summary: Send message to AI chatbot
 *     tags:
 *       - Chatbot
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's message to the chatbot
 *               include_context:
 *                 type: boolean
 *                 default: true
 *                 description: Include user profile context in the message
 *     responses:
 *       200:
 *         description: Chatbot response generated successfully
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
 *                     message_id:
 *                       type: string
 *                     user_message:
 *                       type: string
 *                     bot_response:
 *                       type: string
 *                     response_time_ms:
 *                       type: integer
 */
async function sendMessage(req, res, next) {
    try {
        const userId = req.user.userId;
        const { message, include_context = true } = req.body;
        
        // Validate required fields
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }
        
        const startTime = Date.now();
        
        const response = await chatbotService.processMessage({
            userId,
            message: message.trim(),
            includeContext: include_context
        });
        
        const responseTime = Date.now() - startTime;
        
        res.status(200).json({
            success: true,
            data: {
                message_id: response.message_id,
                user_message: message,
                bot_response: response.response,
                response_time_ms: responseTime
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /chatbot/context:
 *   get:
 *     summary: Get conversation context/history
 *     tags:
 *       - Chatbot
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Number of recent messages to retrieve
 *     responses:
 *       200:
 *         description: Conversation context retrieved successfully
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
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChatbotMessage'
 *                     total_messages:
 *                       type: integer
 */
async function getContext(req, res, next) {
    try {
        const userId = req.user.userId;
        const { limit = 10 } = req.query;
        
        // Validate limit
        const messageLimit = Math.min(Math.max(parseInt(limit), 1), 50);
        
        const context = await chatbotService.getConversationContext(userId, messageLimit);
        
        res.status(200).json({
            success: true,
            data: context
        });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /chatbot/clear:
 *   delete:
 *     summary: Clear conversation history
 *     tags:
 *       - Chatbot
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversation history cleared successfully
 */
async function clearHistory(req, res, next) {
    try {
        const userId = req.user.userId;
        
        await chatbotService.clearConversationHistory(userId);
        
        res.status(200).json({
            success: true,
            data: { message: 'Conversation history cleared successfully' }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    sendMessage,
    getContext,
    clearHistory
};
