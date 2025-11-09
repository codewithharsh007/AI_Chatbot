# 🤖 VaaniAI - AI Chatbot Platform (Version 1.0)

<div align="center">
  <h3>An intelligent, multimodal AI chatbot with personality switching, emotion detection, and comprehensive analytics</h3>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-8.19-green)](https://www.mongodb.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## ✨ Features

### 🎭 **Dynamic User Personalization**
- **6 Personality Modes**: Professional, Casual, Creative, Friendly, Technical, Humorous
- **3 Tone Options**: Formal, Informal, Balanced
- Custom nicknames and user preferences
- Personality-specific greetings and responses

### 🤖 **Multi-LLM Support**
- **OpenAI**: GPT-4, GPT-3.5 Turbo
- **Anthropic**: Claude 3 Opus, Claude 3 Sonnet
- **Google**: Gemini Pro, Gemini Ultra
- Intelligent model routing based on task complexity

### 🎨 **Multimodal Responses**
- **Text**: Natural language conversations
- **Image Generation**: DALL-E 3 integration
- **Chart Generation**: Data visualization with QuickChart
- Mixed response types with intelligent detection

### 🗣️ **Voice Features** ⭐ NEW
- **Speech-to-Text**: Voice input for messages
- **Text-to-Speech**: AI responses read aloud
- Adjustable TTS speed (0.5x - 2.0x)
- Multiple voice options
- Play/pause/stop controls

### 🧠 **Emotion Detection**
- Real-time sentiment analysis
- 7 emotion types: Happy, Sad, Angry, Excited, Confused, Frustrated, Neutral
- Emotion-aware response generation
- Admin dashboard emotion insights

### 👤 **User Authentication**
- Email/Password registration and login
- JWT-based authentication
- Google OAuth support (ready)
- Secure password hashing with bcrypt

### 💼 **Admin Dashboard**
- User management and monitoring
- Model usage tracking per user
- Token consumption analytics
- Cost tracking and optimization
- Emotion analysis insights
- Activity logs and statistics

### 🎨 **User Interface**
- **Dark/Light Mode**: Seamless theme switching
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Typing Animations**: Realistic AI thinking simulation
- **Toast Notifications**: Real-time user feedback
- **Copy to Clipboard**: Easy message sharing
- **Markdown Support**: Rich text formatting

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19.2
- **Styling**: TailwindCSS 4.0
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios

### **Backend**
- **Runtime**: Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer

### **AI Services**
- **OpenAI**: GPT models + DALL-E 3
- **Anthropic**: Claude 3 models
- **Google**: Gemini models
- **Voice**: Web Speech API

---

## 🏗️ System Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│       Next.js Frontend          │
│  - React Components             │
│  - Theme Context                │
│  - TTS Service                  │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│      API Routes (Backend)       │
│  - /api/auth (Login/Signup)     │
│  - /api/chat (AI Processing)    │
│  - /api/user (Profile Mgmt)     │
│  - /api/chats (History)         │
└──────────────┬──────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌─────────┐      ┌──────────────┐
│ MongoDB │      │  AI Services │
│         │      │  - OpenAI    │
│ Models: │      │  - Claude    │
│ - User  │      │  - Gemini    │
│ - Chat  │      └──────────────┘
│ - Analytics │
└─────────┘
```

---

## 📦 Installation

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- API keys for AI services

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/yourusername/vaaniai.git
cd vaaniai
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Environment Setup**
Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/vaaniai

# JWT
JWT_SECRET=your-secret-key-here

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Google Gemini
GEMINI_API_KEY=your-gemini-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Step 4: Start MongoDB**
```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas (update MONGODB_URI)
```

### **Step 5: Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## ⚙️ Configuration

### **API Keys Setup**

#### **OpenAI (GPT & DALL-E)**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

#### **Anthropic (Claude)**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Generate API key
3. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

#### **Google (Gemini)**
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Create API key
3. Add to `.env.local`: `GEMINI_API_KEY=...`

### **MongoDB Setup**

#### **Local MongoDB**
```bash
# Install MongoDB
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com

# Start MongoDB
mongod --dbpath=/path/to/data
```

#### **MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env.local`

---

## 🎯 Usage

### **1. User Registration**
- Navigate to `/signup`
- Enter username, email, and password
- Click "Sign Up"

### **2. Login**
- Navigate to `/login`
- Enter credentials
- Click "Sign In"

### **3. Start Chatting**
- Select a personality mode (top bar)
- Choose AI model from settings
- Type message or use voice input (mic button)
- Send with Enter or Send button

### **4. Text-to-Speech** ⭐
- Enable TTS from top bar (speaker icon)
- AI responses will be read automatically
- Click speaker icon on any message to replay
- Adjust speed in settings

### **5. Voice Input**
- Click microphone button
- Speak your message
- Click again to stop recording

### **6. Copy Messages**
- Click copy icon on any AI response
- Message copied to clipboard

---

## 📡 API Documentation

### **Authentication Endpoints**

#### POST `/api/auth/signup`
Register a new user.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": { ... }
}
```

#### POST `/api/auth/login`
Login existing user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/verify`
Verify JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

---

### **Chat Endpoints**

#### POST `/api/chat`
Send message to AI.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "message": "Hello, how are you?",
  "chatId": "optional-chat-id",
  "model": "gpt-3.5-turbo",
  "personality": "Friendly",
  "tone": "Balanced"
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI response text",
  "responseType": "text",
  "emotion": "happy",
  "tokensUsed": 150,
  "cost": 0.0003,
  "chatId": "chat-id"
}
```

---

### **User Profile Endpoints**

#### GET `/api/user/profile`
Get user profile.

#### PUT `/api/user/profile`
Update user profile.

**Request:**
```json
{
  "personality": "Technical",
  "tone": "Formal",
  "preferences": {
    "ttsEnabled": true,
    "ttsSpeed": 1.2
  }
}
```

---

## 📁 Project Structure

```
vaaniai/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js
│   │   │   ├── signup/route.js
│   │   │   └── verify/route.js
│   │   ├── chat/route.js
│   │   ├── chats/route.js
│   │   └── user/profile/route.js
│   ├── context/
│   │   └── ThemeContext.jsx
│   ├── login/page.jsx
│   ├── signup/page.jsx
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── components/
│   ├── Chatbot.jsx
│   ├── ChatbotEnhanced.jsx (with TTS)
│   └── Sidebar.jsx
├── models/
│   ├── User.js
│   ├── Chat.js
│   ├── AdminAnalytics.js
│   └── TaskLog.js
├── utils/
│   ├── aiHelpers.js
│   ├── openaiService.js
│   ├── claudeService.js
│   ├── geminiService.js
│   └── textToSpeech.js
├── middlewares/
│   └── auth.js
├── lib/
│   └── mongodb.js
├── public/
├── .env.example
├── .env.local
├── package.json
├── next.config.mjs
└── README.md
```

---

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### **Environment Variables**
Add all `.env.local` variables to Vercel dashboard.

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Build for production
npm run build

# Start production server
npm start
```

---

## 📊 Database Schema

### **User Collection**
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  personality: String,
  tone: String,
  preferences: {
    theme: String,
    ttsEnabled: Boolean,
    ttsSpeed: Number,
    ttsVoice: String
  },
  isAdmin: Boolean,
  createdAt: Date
}
```

### **Chat Collection**
```javascript
{
  userId: ObjectId,
  title: String,
  messages: [{
    role: String,
    content: String,
    responseType: String,
    emotion: String,
    timestamp: Date
  }],
  personalityUsed: String,
  modelUsed: String,
  tokensUsed: Number
}
```

---

## 🎓 Academic Project Notes

This is a **minor project** demonstrating:
- Full-stack web development
- AI/ML integration
- Real-time communication
- Database design
- Authentication & authorization
- RESTful API design
- Modern React patterns
- Responsive UI/UX

**Supervisor**: [Your Supervisor Name]  
**Institution**: [Your Institution]  
**Semester**: [Current Semester]

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- OpenAI for GPT and DALL-E APIs
- Anthropic for Claude APIs
- Google for Gemini APIs
- Next.js team for amazing framework
- MongoDB for database solutions

---

## 📧 Contact

**Project Lead**: Your Name  
**Email**: your.email@example.com  
**GitHub**: [@yourusername](https://github.com/yourusername)

---

<div align="center">
  <p>Made with ❤️ for academic excellence</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
