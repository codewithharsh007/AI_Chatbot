import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  responseType: {
    type: String,
    enum: ['text', 'image', 'chart', 'mixed'],
    default: 'text',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  chartData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'neutral', 'excited', 'confused', 'frustrated'],
    default: 'neutral',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'New Chat',
    maxlength: 100,
  },
  messages: [MessageSchema],
  personalityUsed: {
    type: String,
    enum: ['Professional', 'Casual', 'Creative', 'Friendly', 'Technical', 'Humorous'],
    default: 'Friendly',
  },
  modelUsed: {
    type: String,
    enum: [
      'gpt-4',
      'gpt-3.5-turbo',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'gemini-2.5-flash',
      'gemini-ultra',
      'perplexity',
    ],
    default: 'gpt-3.5-turbo',
  },
  tokensUsed: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ChatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
  }
  next();
});

ChatSchema.index({ userId: 1, createdAt: -1 });
ChatSchema.index({ userId: 1, lastMessageAt: -1 });

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
