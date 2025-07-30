const prisma = require('../../config/db');

async function createChatbotMessage(data) {
    const { userId, message, response, contextData, responseTime } = data;
    
    return await prisma.chatbot_messages.create({
        data: {
            user_id: userId,
            message,
            response,
            context_data: contextData,
            response_time_ms: responseTime,
            created_at: new Date()
        }
    });
}

async function getChatbotMessages(userId, limit = 50) {
    return await prisma.chatbot_messages.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: limit,
        select: {
            message_id: true,
            message: true,
            response: true,
            created_at: true,
            response_time_ms: true
        }
    });
}

async function getChatbotMessageCount(userId) {
    return await prisma.chatbot_messages.count({
        where: { user_id: userId }
    });
}

async function deleteChatbotMessages(userId) {
    return await prisma.chatbot_messages.deleteMany({
        where: { user_id: userId }
    });
}

async function getChatbotMessageById(messageId, userId) {
    return await prisma.chatbot_messages.findFirst({
        where: {
            message_id: messageId,
            user_id: userId
        }
    });
}

module.exports = {
    createChatbotMessage,
    getChatbotMessages,
    getChatbotMessageCount,
    deleteChatbotMessages,
    getChatbotMessageById
};
