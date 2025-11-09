import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatWithGPT(messages, model = 'gpt-3.5-turbo', systemPrompt = '') {
  try {
    const formattedMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    return {
      content: response.choices[0].message.content,
      tokensUsed: response.usage.total_tokens,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get response from GPT');
  }
}

export async function generateImageWithDALLE(prompt) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return {
      imageUrl: response.data[0].url,
      revisedPrompt: response.data[0].revised_prompt,
    };
  } catch (error) {
    console.error('DALL-E API Error:', error);
    throw new Error('Failed to generate image');
  }
}
