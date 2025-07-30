const chatbotRepository = require('./chatbot.repository');
const userProfileRepository = require('../user_profile/user_profile.repository');

// Mock OpenAI integration - In production, use actual OpenAI SDK
const mockOpenAI = {
    chat: {
        completions: {
            create: async (params) => {
                // Simulate AI response based on user message
                const userMessage = params.messages[params.messages.length - 1].content;
                let response = "Thank you for your message! ";
                
                if (userMessage.toLowerCase().includes('workout')) {
                    response += "I'd be happy to help you with workout recommendations. Based on your fitness goals, I suggest starting with a balanced routine that includes both cardio and strength training.";
                } else if (userMessage.toLowerCase().includes('nutrition') || userMessage.toLowerCase().includes('diet')) {
                    response += "Great question about nutrition! A balanced diet with proper macronutrients is key to achieving your fitness goals. Make sure to include lean proteins, complex carbs, and healthy fats.";
                } else if (userMessage.toLowerCase().includes('membership')) {
                    response += "I can help you with membership information. We have various plans available to suit different needs and budgets. Would you like me to show you the available options?";
                } else if (userMessage.toLowerCase().includes('gym')) {
                    response += "We have several gym locations with state-of-the-art equipment and certified trainers. Each location offers unique amenities and classes.";
                } else {
                    response += "I'm here to help you with your fitness journey! Feel free to ask me about workouts, nutrition, memberships, or any fitness-related questions.";
                }
                
                return {
                    choices: [{
                        message: {
                            content: response
                        }
                    }],
                    usage: {
                        total_tokens: 150
                    }
                };
            }
        }
    }
};

async function processMessage(data) {
    const { userId, message, includeContext } = data;
    
    // Get user context if requested
    let contextData = null;
    if (includeContext) {
        contextData = await getUserContext(userId);
    }
    
    // Prepare messages for AI
    const messages = [
        {
            role: "system",
            content: generateSystemPrompt(contextData)
        },
        {
            role: "user",
            content: message
        }
    ];
    
    // Get AI response
    const aiResponse = await mockOpenAI.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
    });
    
    const botResponse = aiResponse.choices[0].message.content;
    
    // Store conversation in database
    const chatMessage = await chatbotRepository.createChatbotMessage({
        userId,
        message,
        response: botResponse,
        contextData,
        responseTime: 500 // Mock response time
    });
    
    return {
        message_id: chatMessage.message_id,
        response: botResponse
    };
}

async function getConversationContext(userId, limit) {
    const messages = await chatbotRepository.getChatbotMessages(userId, limit);
    const totalMessages = await chatbotRepository.getChatbotMessageCount(userId);
    
    return {
        messages,
        total_messages: totalMessages
    };
}

async function clearConversationHistory(userId) {
    return await chatbotRepository.deleteChatbotMessages(userId);
}

// Helper functions
async function getUserContext(userId) {
    try {
        const profile = await userProfileRepository.findProfileByUserId(userId);
        
        if (!profile) {
            return null;
        }
        
        return {
            age: calculateAge(profile.date_of_birth),
            gender: profile.gender,
            height_cm: profile.height_cm,
            weight_kg: profile.weight_kg,
            fitness_goal: profile.primary_fitness_goal,
            dietary_preferences: profile.dietary_preferences,
            allergies: profile.allergies
        };
    } catch (error) {
        console.error('Error getting user context:', error);
        return null;
    }
}

function generateSystemPrompt(contextData) {
    let prompt = "You are FitBot, a helpful AI fitness assistant for Fitflix, a premium fitness platform. You provide personalized advice on workouts, nutrition, and wellness. Be encouraging, knowledgeable, and always prioritize user safety.";
    
    if (contextData) {
        prompt += "\n\nUser Context:";
        if (contextData.age) prompt += `\n- Age: ${contextData.age} years old`;
        if (contextData.gender) prompt += `\n- Gender: ${contextData.gender}`;
        if (contextData.height_cm) prompt += `\n- Height: ${contextData.height_cm}cm`;
        if (contextData.weight_kg) prompt += `\n- Weight: ${contextData.weight_kg}kg`;
        if (contextData.fitness_goal) prompt += `\n- Fitness Goal: ${contextData.fitness_goal}`;
        if (contextData.dietary_preferences && contextData.dietary_preferences.length > 0) {
            prompt += `\n- Dietary Preferences: ${contextData.dietary_preferences.join(', ')}`;
        }
        if (contextData.allergies && contextData.allergies.length > 0) {
            prompt += `\n- Allergies: ${contextData.allergies.join(', ')}`;
        }
        
        prompt += "\n\nUse this context to provide personalized recommendations, but always encourage consulting with healthcare professionals for medical advice.";
    }
    
    return prompt;
}

function calculateAge(birthDate) {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

module.exports = {
    processMessage,
    getConversationContext,
    clearConversationHistory
};
