# 🤖 AI Chatbot — Full-Stack Conversational AI Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Google Gemini API](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google-gemini&logoColor=white)](https://aistudio.google.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

> **"Empowering seamless human-AI interactions with multi-modal voice, multilingual intelligence, and persistent conversations."** ✨

A feature-packed, full-stack AI Chatbot application built with **React**, **Node.js / Express**, **MongoDB**, and the **Google Gemini Generative AI API** (`gemini-3.6-flash`).

---

## 🔗 Live Deployments & Source Code

- 🌐 **Live Frontend Application (Vercel):[https://my-ai-chatbot-frontend-npx1.vercel.app/]
- 💻 **GitHub Repository:** [arpanbasak90-cyber / friend-ai-chatbot](https://github.com/arpanbasak90-cyber/friend-ai-chatbot)

---

## 🎯 Key Features

### 🤖 Generative AI Engine
- Powered by **Google Gemini API** (`gemini-3.6-flash`) for fast, context-aware responses.
- **Graceful Fallback Mode:** Built-in resilience system that handles rate limits, quota limits (HTTP 429), or missing keys without crashing.
- Real-time typing indicators and interactive response rendering.

### 🔐 Authentication & User Sessions
- **JWT-Based Authentication:** Secure user signup, login, and token storage.
- Protected user routes and isolated user session state.
- Persistent session storage allowing quick re-entry without re-authenticating.

### 💬 Conversation & History Management
- Multi-session chat history sidebar.
- Create new chats, switch between existing threads, or clear current conversation windows.
- Persistent database storage with fallback in-memory cache when offline or unconfigured.

### 🎙️ Speech-to-Text (Voice Input)
- Talk directly to the AI using your microphone via the browser **Web Speech Recognition API**.
- Hands-free prompt dictation.
- Auto-detects spoken text in selected target languages.

### 🔊 Text-to-Speech (AI Voice Output)
- AI responses can be spoken aloud automatically using the **Speech Synthesis API**.
- Per-message audio controls: 🔊 Read Aloud / 🔇 Mute / Stop Voice.
- Language-matched pronunciation for multi-language responses.

### 🌐 Multilingual Support (14 Languages)
Seamlessly switch target languages for speech synthesis and recognition:

| # | Language | Code / Native Name | # | Language | Code / Native Name |
|---|---|---|---|---|---|
| 1 | 🇬🇧 **English** | `en-US` | 8 | 🇮🇳 **Punjabi** | `pa-IN` (ਪੰਜਾਬੀ) |
| 2 | 🇮🇳 **Hindi** | `hi-IN` (हिंदी) | 9 | 🇮🇳 **Tamil** | `ta-IN` (தமிழ்) |
| 3 | 🇮🇳 **Bengali** | `bn-IN` (বাংলা) | 10 | 🇮🇳 **Telugu** | `te-IN` (తెలుగు) |
| 4 | 🇮🇳 **Gujarati** | `gu-IN` (ગુજરાતી) | 11 | 🇮🇳 **Urdu** | `ur-IN` (اردو) |
| 5 | 🇮🇳 **Kannada** | `kn-IN` (ಕನ್ನಡ) | 12 | 🇮🇳 **Odia** | `or-IN` (ଓଡ଼ିଆ) |
| 6 | 🇮🇳 **Malayalam** | `ml-IN` (മലയാളം) | 13 | 🇮🇳 **Assamese** | `as-IN` (অসমীয়া) |
| 7 | 🇮🇳 **Marathi** | `mr-IN` (मराठी) | 14 | 🇮🇳 **Sanskrit** | `sa-IN` (संस्कृतम्) |

### 🌙 Dark / Light Theme Modes
- Toggle instantly between ☀️ Light Mode and 🌙 Dark Mode.
- Modern glassmorphism UI with smooth CSS transitions.

---

## 🏛️ System Architecture

```mermaid
graph TD
    User([User / Browser Client])

    subgraph Frontend ["Frontend (React 19 + Vite)"]
        UI[Chat Interface & Sidebar]
        SpeechRec[Web Speech Recognition API]
        SpeechSyn[Speech Synthesis Engine]
        AuthStore[JWT LocalStorage Token]
    end

    subgraph Backend ["Backend Gateway (Node.js + Express 5)"]
        API[Express REST API Router]
        AuthMiddleware[JWT Verification Router]
        AIHandler[Gemini AI Service Module]
        FallbackEngine[Resilience & Fallback Handler]
    end

    subgraph Services ["External Services & Storage"]
        Gemini[Google Gemini API]
        MongoDB[(MongoDB Atlas / In-Memory Cache)]
    end

    User -->|Voice / Text Input| UI
    UI -->|Speech-to-Text| SpeechRec
    SpeechRec -->|Populate Input| UI
    UI -->|Auth Requests| API
    UI -->|Send Prompt + Chat ID| API
    API --> AuthMiddleware
    API --> AIHandler
    AIHandler -->|generateContent()| Gemini
    Gemini -->|AI Response| AIHandler
    AIHandler -->|Fallback if Error| FallbackEngine
    API -->|Save Message| MongoDB
    API -->|JSON Response| UI
    UI -->|Text-to-Speech| SpeechSyn
```

---

## 📁 Project Folder Structure

```text
friend-ai-chatbot/
├── backened/                   # Node.js + Express REST API Server
│   ├── models/                 # Database Schemas (Mongoose)
│   │   ├── message.js          # Chat Message Schema
│   │   └── user.js             # User Authentication Schema
│   ├── routes/                 # Express API Endpoint Routes
│   │   └── auth.js             # User Auth (Signup / Login)
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Backend dependencies & scripts
│   └── server.js               # Express application entry & Gemini API logic
│
├── frontend/                   # React 19 Single Page Application
│   ├── public/                 # Static assets & favicon
│   ├── src/                    # Source code
│   │   ├── assets/             # Branding icons & image assets
│   │   ├── components/         # Reusable React components
│   │   │   ├── Login.jsx       # User login modal/page component
│   │   │   └── Signup.jsx      # User registration modal/page component
│   │   ├── App.jsx             # Main Application Container & Chat Logic
│   │   ├── App.css             # Component layout & UI styles
│   │   ├── index.css           # Global CSS variables & dark theme styling
│   │   └── main.jsx            # React root DOM entry
│   ├── index.html              # HTML shell entry point
│   ├── package.json            # Frontend dependencies & scripts
│   └── vite.config.js          # Vite build configuration
│
├── package.json                # Root monorepo workspace configuration
├── vercel.json                 # Vercel deployment build & rewrite settings
├── LICENSE                     # Project License (MIT)
└── README.md                   # Complete documentation
```

---

## 🛠️ Tech Stack & Dependencies

### Frontend Framework & Libraries
- **React 19** — Component-driven user interface architecture.
- **Vite 8** — Fast frontend build tool and dev server.
- **Web Speech API** — Native browser APIs for SpeechRecognition and SpeechSynthesis.
- **CSS3 Custom Properties** — Modern theme management and responsive layouts.

### Backend Infrastructure & AI Integration
- **Node.js** — Asynchronous JavaScript runtime.
- **Express.js 5** — RESTful HTTP routing framework.
- **Google Generative AI SDK (`@google/generative-ai`)** — Integration with Gemini (`gemini-3.6-flash`).
- **Mongoose 9 / MongoDB** — NoSQL document database storage.
- **JSONWebToken (`jsonwebtoken`)** — JWT token authorization.
- **Bcrypt / BcryptJS** — Password hashing.
- **CORS & Dotenv** — Security middleware and environment handling.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed on your local development machine:
- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher)
- **MongoDB** instance (Optional: server uses in-memory storage if omitted)
- **Google Gemini API Key** (Free key available at [Google AI Studio](https://aistudio.google.com/app/apikey))

---

### 📥 Step-by-Step Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/mehulikhanra904-prog/my-ai-chatbot.git
   cd my-ai-chatbot
   ```

2. **Install All Dependencies:**
   The repository is configured as an npm workspace. Installing from the root will install dependencies for both `frontend` and `backened`:
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file inside the `backened/` directory based on `.env.example`:

   ```bash
   cp backened/.env.example backened/.env
   ```

   Fill in your configuration details inside `backened/.env`:
   ```env
   # Gemini AI API Key
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-3.6-flash

   # Database Connection (Optional - falls back to in-memory if empty)
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot

   # Security Token
   JWT_SECRET=your_super_secret_jwt_key_12345

   # Server Configuration
   PORT=5000
   USE_AI_FALLBACK=true
   AI_FALLBACK_REPLY="I'm temporarily unable to access the AI service right now. Please try again in a moment."
   ```

4. **Run the Application:**
   Start both backend and frontend servers concurrently with a single command:
   ```bash
   npm run dev
   ```

   - **Frontend App:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 📡 API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user | `{ "name": "...", "email": "...", "password": "..." }` |
| `POST` | `/api/auth/login` | Log in user and receive JWT token | `{ "email": "...", "password": "..." }` |

### Chat & Message Endpoints

| Method | Endpoint | Description | Request / Query Params |
|---|---|---|---|
| `GET` | `/` | Health check route | None |
| `POST` | `/api/chat` | Send prompt to Gemini AI and get response | `{ "message": "...", "chatId": "..." }` |
| `GET` | `/api/messages/:chatId` | Fetch message history for specific chat ID | Route param: `:chatId` |
| `GET` | `/api/chats` | List summary of all saved past chat threads | None |

---

## ⚙️ Environment Variables Reference

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Recommended | `""` | Google Gemini API key from AI Studio |
| `GEMINI_MODEL` | Optional | `gemini-3.6-flash` | Generative AI model name |
| `MONGODB_URI` | Optional | `""` (In-memory storage) | MongoDB connection string |
| `JWT_SECRET` | Required for Auth | `""` | Secret key for signing JWT auth tokens |
| `PORT` | Optional | `5000` | HTTP port for Node.js Express server |
| `USE_AI_FALLBACK` | Optional | `true` | Enable friendly response fallback on rate limit |
| `AI_FALLBACK_REPLY`| Optional | Generic message | Custom text to return when AI is unreachable |

---

## 🌐 Deployment Guide

### Deploying to Vercel

The application includes a `vercel.json` configuration for single-step deployment:

1. Push your code to GitHub.
2. Import your repository into [Vercel](https://vercel.com).
3. Set the Environment Variables in the Vercel Dashboard (`GEMINI_API_KEY`, `MONGODB_URI`, `JWT_SECRET`).
4. Click **Deploy**. Vercel will automatically run `npm run build` and host the application.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](file:///c:/Users/Admin/OneDrive/Desktop/friend%27s%20AI%20chatbot/friend-ai-chatbot/LICENSE) file for details.

```text
MIT License

Copyright (c) 2026 AI Chatbot Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [Issues page](https://github.com/mehulikhanra904-prog/my-ai-chatbot/issues).

---

<p align="center">
  Crafted with ❤️ and powered by <strong>Google Gemini & React</strong>
</p>
