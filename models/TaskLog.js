import mongoose from 'mongoose';

const TaskLogSchema = new mongoose.Schema({
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
  taskType: {
    type: String,
    enum: ['calculation', 'code_execution', 'data_analysis', 'web_search', 'file_operation', 'reminder', 'other'],
    required: true,
  },
  taskDescription: {
    type: String,
    required: true,
    maxlength: 500,
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'failed'],
    default: 'pending',
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

// Index for task history queries
TaskLogSchema.index({ userId: 1, createdAt: -1 });
TaskLogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.TaskLog || mongoose.model('TaskLog', TaskLogSchema);
