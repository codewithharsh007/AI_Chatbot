import mongoose from 'mongoose';

const AdminAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  modelUsed: {
    type: String,
    enum: [
      'gpt-4',
      'gpt-3.5-turbo',
      'claude-3-opus',
      'claude-3-sonnet',
      'gemini-2.5-flash',
      'gemini-ultra',
      'perplexity',
      'dall-e-3',
      'gemini-vision',
    ],
    required: true,
  },
  tokensConsumed: {
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
  },
  cost: {
    type: Number,
    default: 0,
    min: 0,
  },
  responseType: {
    type: String,
    enum: ['text', 'image', 'chart', 'mixed'],
    default: 'text',
  },
  responseTime: {
    type: Number,
    default: 0,
  },
  emotionDetected: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'neutral', 'excited', 'confused', 'frustrated'],
    default: 'neutral',
  },
  personalityMode: {
    type: String,
    enum: ['Professional', 'Casual', 'Creative', 'Friendly', 'Technical', 'Humorous'],
    default: 'Friendly',
  },
  success: {
    type: Boolean,
    default: true,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

AdminAnalyticsSchema.index({ date: -1, userId: 1 });
AdminAnalyticsSchema.index({ userId: 1, modelUsed: 1, date: -1 });
AdminAnalyticsSchema.index({ modelUsed: 1, date: -1 });

export default mongoose.models.AdminAnalytics || mongoose.model('AdminAnalytics', AdminAnalyticsSchema);
