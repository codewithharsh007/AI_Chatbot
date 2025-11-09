# 🚀 VaaniAI - Quick Start Guide

## Setup Instructions (5 Minutes)

### Step 1: Install Dependencies ✅ (Already Done)
```bash
npm install
```

### Step 2: Get API Keys 🔑

#### **Required (Choose at least one):**

1. **OpenAI (Recommended for beginners)**
   - Visit: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-...`)
   - Cost: ~$0.002 per 1K tokens (GPT-3.5)

2. **Anthropic Claude**
   - Visit: https://console.anthropic.com/
   - Get API key
   - Copy the key (starts with `sk-ant-...`)

3. **Google Gemini**
   - Visit: https://makersuite.google.com/app/apikey
   - Create API key
   - Copy the key

### Step 3: Setup Database 🗄️

#### **Option A: Local MongoDB (Recommended for development)**
```bash
# Download and install MongoDB from mongodb.com
# Start MongoDB
mongod
```
Your connection string: `mongodb://localhost:27017/vaaniai`

#### **Option B: MongoDB Atlas (Cloud - Free tier available)**
1. Go to mongodb.com/atlas
2. Create free account
3. Create cluster (free M0)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your database password

### Step 4: Configure Environment 🔧

Create/Edit `.env.local` file in the project root:

```env
# Database (Choose one)
MONGODB_URI=mongodb://localhost:27017/vaaniai
# OR
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vaaniai

# JWT Secret (any random string)
JWT_SECRET=your-random-secret-key-here

# AI APIs (Add at least one)
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
GEMINI_API_KEY=your-gemini-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Start the Application 🎉

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## First Time Usage 👤

### 1. Create Account
- Go to http://localhost:3000/signup
- Enter username, email, password
- Click "Sign Up"

### 2. Start Chatting
- You'll be redirected to the main chat
- Select a personality (top bar)
- Type a message or use voice input
- Press Enter or click Send

### 3. Try Features

#### **Text Chat**
```
"Tell me a joke"
"Explain quantum physics"
"Write a poem about AI"
```

#### **Image Generation** (Requires OpenAI key)
```
"Generate an image of a futuristic city"
"Create a picture of a sunset on Mars"
```

#### **Voice Features**
- Click **microphone icon** to speak
- Click **speaker icon** to hear AI responses
- Adjust speed in settings (gear icon)

#### **Personality Modes**
Try different modes from the dropdown:
- **Professional**: Business-like responses
- **Casual**: Friendly, conversational
- **Creative**: Imaginative and unique
- **Technical**: Detailed, precise
- **Humorous**: Funny and entertaining

---

## Troubleshooting 🔧

### "Cannot connect to database"
- ✅ Make sure MongoDB is running
- ✅ Check `MONGODB_URI` in `.env.local`
- Test connection: `mongosh "mongodb://localhost:27017"`

### "API key invalid"
- ✅ Verify API key is correct (no extra spaces)
- ✅ Check API key is active on provider dashboard
- ✅ Ensure you have credits/billing enabled

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Speech recognition not working
- ✅ Use Chrome or Edge (best support)
- ✅ Allow microphone permissions
- ✅ Check microphone is not used by other apps

### TTS (Text-to-Speech) not working
- ✅ Check browser compatibility (Chrome recommended)
- ✅ Ensure volume is up
- ✅ Try different browser if issues persist

---

## Default Features Enabled ✨

- ✅ Dark mode (toggle in sidebar)
- ✅ Text-to-Speech (toggle in top bar)
- ✅ Speech-to-Text (microphone button)
- ✅ Personality modes (dropdown)
- ✅ Multiple AI models
- ✅ Copy to clipboard
- ✅ Conversation history

---

## API Cost Estimates 💰

### OpenAI GPT-3.5 Turbo (Cheapest)
- Input: $0.0015 per 1K tokens
- Output: $0.002 per 1K tokens
- **Example**: 100 messages ≈ $0.50

### OpenAI GPT-4 (Advanced)
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- **Example**: 100 messages ≈ $10

### DALL-E 3 (Image Generation)
- $0.04 per image (1024x1024)
- **Example**: 10 images = $0.40

### Claude 3 Sonnet
- Input: $0.003 per 1K tokens
- Output: $0.015 per 1K tokens
- **Example**: 100 messages ≈ $2

### Gemini Pro (Cheapest)
- Input: $0.00025 per 1K tokens
- Output: $0.0005 per 1K tokens
- **Example**: 100 messages ≈ $0.10

**💡 Tip**: Start with Gemini Pro or GPT-3.5 for cost-effective testing!

---

## Testing the Project 🧪

### Test Authentication
```bash
# 1. Sign up with new account
# 2. Log out
# 3. Log in with same credentials
# ✅ Should work without errors
```

### Test AI Features
```bash
# 1. Send text message → Should get AI response
# 2. Try "generate image of a cat" → Should create image (OpenAI only)
# 3. Click voice input → Speak → Should transcribe
# 4. Click speaker on AI response → Should read aloud
```

### Test Personalities
```bash
# Change personality to each mode and ask:
# "Tell me about artificial intelligence"
# Compare responses - they should have different tones!
```

---

## Project Demo Checklist ✅

For academic presentation, demonstrate:

1. ⬜ User registration and login
2. ⬜ Multiple personality modes
3. ⬜ Text chat with different AI models
4. ⬜ Image generation (if OpenAI key available)
5. ⬜ Speech-to-text (voice input)
6. ⬜ Text-to-speech (AI reading responses)
7. ⬜ Dark/Light mode toggle
8. ⬜ Conversation history
9. ⬜ User profile management
10. ⬜ Real-time emotion detection

---

## Next Steps 🎯

### Enhance Your Project:

1. **Add Admin Dashboard**
   - User management
   - Analytics and statistics
   - Cost tracking

2. **Implement More Features**
   - File upload support
   - Code execution
   - Web search integration

3. **Improve UI/UX**
   - Custom themes
   - Animation effects
   - Mobile app version

4. **Deploy to Production**
   - Use Vercel for hosting
   - MongoDB Atlas for database
   - Environment variables in Vercel

---

## Support & Resources 📚

- **OpenAI Docs**: https://platform.openai.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Common Commands 💻

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Install new package
npm install package-name

# Check MongoDB connection
mongosh "mongodb://localhost:27017"
```

---

## Academic Project Presentation Tips 🎓

### Key Points to Highlight:

1. **Technology Stack**
   - Modern React/Next.js framework
   - Multiple AI model integration
   - Real-time features (TTS, STT)
   - Secure authentication

2. **Unique Features**
   - 6 personality modes
   - Emotion detection
   - Multimodal responses
   - Voice capabilities

3. **Technical Challenges**
   - API rate limiting
   - Token optimization
   - Real-time processing
   - State management

4. **Future Scope**
   - Mobile application
   - Advanced analytics
   - More AI models
   - Enterprise features

---

<div align="center">
  <p><strong>🎉 Congratulations! Your VaaniAI project is ready!</strong></p>
  <p>If you encounter any issues, check the troubleshooting section above.</p>
  <p>⭐ Remember to star the repository!</p>
</div>
