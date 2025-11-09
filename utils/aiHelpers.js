// Emotion detection using keyword analysis
export function detectEmotion(text) {
  const emotions = {
    happy: ['happy', 'joy', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'love', 'excited', 'perfect', 'awesome', '😊', '😄', '🎉', '❤️'],
    sad: ['sad', 'unhappy', 'disappointed', 'depressed', 'down', 'upset', 'crying', 'tear', '😢', '😭', '☹️'],
    angry: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated', 'hate', 'pissed', '😠', '😡', '🤬'],
    excited: ['excited', 'thrilled', 'enthusiastic', 'eager', 'pumped', 'stoked', 'wow', '🤩', '😍', '🔥'],
    confused: ['confused', 'don\'t understand', 'unclear', 'puzzled', 'lost', 'what', '?', '🤔', '😕'],
    frustrated: ['frustrated', 'stuck', 'difficult', 'hard', 'struggling', 'can\'t', 'unable', '😤', '😣'],
  };

  const lowerText = text.toLowerCase();
  const emotionScores = {};

  for (const [emotion, keywords] of Object.entries(emotions)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score++;
      }
    }
    emotionScores[emotion] = score;
  }

  let maxScore = 0;
  let detectedEmotion = 'neutral';

  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion;
    }
  }

  return detectedEmotion;
}

export function getPersonalityPrompt(personality, tone) {
  const prompts = {
    Professional: {
      Formal: "Respond in a highly professional, formal, and business-like manner. Use proper grammar and maintain a respectful tone.",
      Informal: "Respond professionally but in a more conversational way. Keep it polished yet friendly.",
      Balanced: "Respond in a professional manner while being approachable. Balance expertise with warmth.",
    },
    Casual: {
      Formal: "Respond in a casual but respectful manner. Keep it friendly and relaxed.",
      Informal: "Respond in a very casual, friendly, and conversational way. Be like talking to a friend.",
      Balanced: "Respond casually but maintain clarity and respect. Be friendly and easygoing.",
    },
    Creative: {
      Formal: "Respond creatively with unique perspectives while maintaining structure and clarity.",
      Informal: "Respond with creative flair, using metaphors and imaginative language freely.",
      Balanced: "Respond creatively and engagingly while keeping the message clear and accessible.",
    },
    Friendly: {
      Formal: "Respond in a warm and friendly manner while being respectful and clear.",
      Informal: "Respond in a very warm, supportive, and encouraging way. Be like a close friend.",
      Balanced: "Respond in a friendly and supportive way while maintaining helpfulness and clarity.",
    },
    Technical: {
      Formal: "Respond with technical precision and detailed explanations. Be thorough and accurate.",
      Informal: "Respond technically but explain concepts in a more accessible and conversational way.",
      Balanced: "Respond with technical accuracy while keeping explanations clear and understandable.",
    },
    Humorous: {
      Formal: "Respond with subtle wit and clever observations while staying on topic.",
      Informal: "Respond with humor, jokes, and playful language. Make the interaction fun and entertaining.",
      Balanced: "Respond with light humor and wit while ensuring the information is helpful and clear.",
    },
  };

  return prompts[personality]?.[tone] || prompts.Friendly.Balanced;
}

export function getPersonalityGreeting(personality, userName = 'there') {
  const greetings = {
    Professional: `Good day, ${userName}. How may I assist you today?`,
    Casual: `Hey ${userName}! What's up? How can I help?`,
    Creative: `Greetings, ${userName}! Ready to explore some creative ideas together?`,
    Friendly: `Hi ${userName}! 😊 It's great to see you! How can I help you today?`,
    Technical: `Hello ${userName}. Ready to dive into some technical solutions?`,
    Humorous: `Well, well, well... look who it is! ${userName} is here! What adventures await us today? 😄`,
  };

  return greetings[personality] || greetings.Friendly;
}

export function calculateCost(model, tokensUsed) {
  const pricing = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'gemini-2.5-flash': { input: 0.075, output: 0.3 },
    'gemini-ultra': { input: 0.001, output: 0.002 },
    'perplexity': { input: 0.001, output: 0.001 },
    'dall-e-3': { image: 0.04 },
  };

  const modelPricing = pricing[model];
  if (!modelPricing) return 0;

  if (modelPricing.image) {
    return modelPricing.image;
  }

  const promptTokens = Math.floor(tokensUsed * 0.6);
  const completionTokens = Math.floor(tokensUsed * 0.4);

  const cost = (promptTokens / 1000) * modelPricing.input + 
               (completionTokens / 1000) * modelPricing.output;

  return parseFloat(cost.toFixed(6));
}

export function detectResponseType(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  const imageKeywords = ['generate image', 'create image', 'draw', 'picture of', 'visualize', 'show me', 'image of', 'photo of'];
  if (imageKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'image';
  }

  const chartKeywords = ['chart', 'graph', 'plot', 'visualize data', 'show data', 'bar chart', 'line chart', 'pie chart'];
  if (chartKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'chart';
  }

  return 'text';
}
