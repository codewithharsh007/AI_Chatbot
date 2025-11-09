import { NextResponse } from "next/server";
import { verifyToken } from "@/middlewares/auth";
import { connectToDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import AdminAnalytics from "@/models/AdminAnalytics";
import {
  detectEmotion,
  getPersonalityPrompt,
  calculateCost,
  detectResponseType,
} from "@/utils/aiHelpers";

export async function POST(request) {
  const startTime = Date.now();

  try {
    // Verify user authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const {
      message,
      chatId,
      model = "gpt-3.5-turbo",
      personality = "Friendly",
      tone = "Balanced",
    } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    await connectToDB();

    // Detect emotion in user message
    const emotion = detectEmotion(message);

    // Detect response type
    const responseType = detectResponseType(message);

    // Get personality-based system prompt
    const systemPrompt = getPersonalityPrompt(personality, tone);

    let responseData;
    let tokensUsed = 0;
    let promptTokens = 0;
    let completionTokens = 0;

    // Handle different response types
    if (responseType === "image") {
      // Generate image
      try {
        const { generateImageWithDALLE } = require("@/utils/openaiService");
        const imageResult = await generateImageWithDALLE(message);
        responseData = {
          content: `Here's the image I generated based on your request: "${imageResult.revisedPrompt}"`,
          responseType: "image",
          imageUrl: imageResult.imageUrl,
        };
        tokensUsed = 0;
      } catch (error) {
        console.error("Image generation failed:", error);
        responseData = {
          content:
            "I apologize, but I'm unable to generate images at the moment. Please try again later.",
          responseType: "text",
        };
      }
    } else if (responseType === "chart") {
      // For chart generation, first get the data from AI, then create chart
      let aiResponse;
      try {
        const messages = [{ role: "user", content: message }];

        // Route to appropriate AI model
        if (model.startsWith("gpt")) {
          const { chatWithGPT } = require("@/utils/openaiService");
          aiResponse = await chatWithGPT(messages, model, systemPrompt);
        } else if (model.startsWith("claude")) {
          const { chatWithClaude } = require("@/utils/claudeService");
          aiResponse = await chatWithClaude(messages, model, systemPrompt);
        } else if (model.startsWith("gemini")) {
          // Updated: only check for gemini now
          const { chatWithGemini } = require("@/utils/geminiService");
          aiResponse = await chatWithGemini(messages, model, systemPrompt);
        }

        tokensUsed = aiResponse.tokensUsed;
        promptTokens = aiResponse.promptTokens;
        completionTokens = aiResponse.completionTokens;

        responseData = {
          content: aiResponse.content,
          responseType: "chart",
          chartData: null,
        };
      } catch (error) {
        console.error("Chart generation failed:", error);
        responseData = {
          content:
            "I apologize, but I'm unable to generate charts at the moment. Please try again later.",
          responseType: "text",
        };
      }
    } else {
      // Regular text response
      try {
        const messages = [{ role: "user", content: message }];
        let aiResponse;

        // Route to appropriate AI model
        if (model.startsWith("gpt")) {
          const { chatWithGPT } = require("@/utils/openaiService");
          aiResponse = await chatWithGPT(messages, model, systemPrompt);
        } else if (model.startsWith("claude")) {
          const { chatWithClaude } = require("@/utils/claudeService");
          aiResponse = await chatWithClaude(messages, model, systemPrompt);
        } else if (model.startsWith("gemini")) {
          // Updated: only check for gemini now
          const { chatWithGemini } = require("@/utils/geminiService");
          aiResponse = await chatWithGemini(messages, model, systemPrompt);
        } else {
          // Default to GPT-3.5
          const { chatWithGPT } = require("@/utils/openaiService");
          aiResponse = await chatWithGPT(
            messages,
            "gpt-3.5-turbo",
            systemPrompt,
          );
        }

        tokensUsed = aiResponse.tokensUsed;
        promptTokens = aiResponse.promptTokens;
        completionTokens = aiResponse.completionTokens;

        responseData = {
          content: aiResponse.content,
          responseType: "text",
        };
      } catch (error) {
        console.error("AI response failed:", error);
        responseData = {
          content:
            "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
          responseType: "text",
        };
      }
    }

    const responseTime = Date.now() - startTime;

    // Save or update chat in database
    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat || chat.userId.toString() !== authResult.userId) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
    } else {
      // Create new chat
      chat = new Chat({
        userId: authResult.userId,
        title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
        messages: [],
        personalityUsed: personality,
        modelUsed: model,
      });
    }

    // Add messages to chat
    chat.messages.push({
      role: "user",
      content: message,
      emotion: emotion,
      timestamp: new Date(),
    });

    chat.messages.push({
      role: "assistant",
      content: responseData.content,
      responseType: responseData.responseType,
      imageUrl: responseData.imageUrl || "",
      chartData: responseData.chartData || null,
      timestamp: new Date(),
    });

    chat.tokensUsed += tokensUsed;
    await chat.save();

    // Log analytics
    const cost = calculateCost(model, tokensUsed);
    const analytics = new AdminAnalytics({
      userId: authResult.userId,
      chatId: chat._id,
      modelUsed: model,
      tokensConsumed: {
        promptTokens,
        completionTokens,
        totalTokens: tokensUsed,
      },
      cost,
      responseType: responseData.responseType,
      responseTime,
      emotionDetected: emotion,
      personalityMode: personality,
      success: true,
    });
    await analytics.save();

    return NextResponse.json({
      success: true,
      response: responseData.content,
      responseType: responseData.responseType,
      imageUrl: responseData.imageUrl,
      chartData: responseData.chartData,
      chatId: chat._id,
      emotion,
      tokensUsed,
      cost,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request", details: error.message },
      { status: 500 },
    );
  }
}
