import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function chatWithClaude(messages, model = 'claude-3-sonnet-20240229', systemPrompt = '') {
  try {
    // Format messages for Claude (remove system messages from array)
    const formattedMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }));

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 2000,
      system: systemPrompt || undefined,
      messages: formattedMessages,
    });

    // Estimate token usage (Claude doesn't always provide exact counts)
    const estimatedPromptTokens = messages.reduce((acc, msg) => acc + Math.ceil(msg.content.length / 4), 0);
    const estimatedCompletionTokens = Math.ceil(response.content[0].text.length / 4);

    return {
      content: response.content[0].text,
      tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || estimatedPromptTokens + estimatedCompletionTokens,
      promptTokens: response.usage?.input_tokens || estimatedPromptTokens,
      completionTokens: response.usage?.output_tokens || estimatedCompletionTokens,
    };
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error('Failed to get response from Claude');
  }
}
