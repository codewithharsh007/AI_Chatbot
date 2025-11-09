import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function chatWithGemini(messages, model = 'gemini-2.5-flash', systemPrompt = '') {
  try {
    const geminiModel = genAI.getGenerativeModel({ model });

    // Convert messages to proper format for Gemini
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start a chat session with the model
    const chat = geminiModel.startChat({
      history: formattedMessages.slice(0, -1), // All messages except the last
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const finalPrompt = systemPrompt
      ? `${systemPrompt}\n\n${lastMessage.content}`
      : lastMessage.content;

    // Send message and get response
    const result = await chat.sendMessage(finalPrompt);
    
    if (!result || !result.response) {
      throw new Error('No response from Gemini API');
    }

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response text from Gemini API');
    }

    // Estimate token usage
    const estimatedTokens = Math.ceil(text.length / 4);

    return {
      content: text,
      tokensUsed: estimatedTokens,
      promptTokens: Math.ceil(estimatedTokens * 0.6),
      completionTokens: Math.ceil(estimatedTokens * 0.4),
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    console.error('Error Details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
    });
    throw new Error(`Failed to get response from Gemini: ${error.message}`);
  }
}

export async function generateImageWithGemini(prompt) {
  try {
    throw new Error('Gemini image generation not yet available. Use DALL-E instead.');
  } catch (error) {
    console.error('Gemini Image Generation Error:', error);
    throw error;
  }
}
