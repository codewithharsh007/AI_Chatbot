import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google OAuth
    },
    minlength: [6, 'Password must be at least 6 characters'],
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  nicknames: {
    type: [String],
    default: [],
  },
  personality: {
    type: String,
    enum: ['Professional', 'Casual', 'Creative', 'Friendly', 'Technical', 'Humorous'],
    default: 'Friendly',
  },
  tone: {
    type: String,
    enum: ['Formal', 'Informal', 'Balanced'],
    default: 'Balanced',
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    language: {
      type: String,
      default: 'en',
    },
    ttsEnabled: {
      type: Boolean,
      default: true,
    },
    ttsVoice: {
      type: String,
      default: 'default',
    },
    ttsSpeed: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
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

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
