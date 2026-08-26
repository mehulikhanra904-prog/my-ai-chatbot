
# 🤖 My AI Chatbot

<p align="center">
  <strong>A modern full-stack AI chatbot powered by Google Gemini and MongoDB.</strong>
</p>

<p align="center">
  <a href="https://my-ai-chatbot-sigma-brown.vercel.app/"
  


[live demo] ("https://my-ai-chatbot-sigma-brown.vercel.app/")

  
    
  </a>
  •
  <a href="https://github.com/mehulikhanra904-prog/my-ai-chatbot">
    💻 <strong>Source Code</strong>
  </a>
</p>

---

# 🤖 My AI Chatbot

> **"Build the future, one conversation at a time."** ✨

My AI Chatbot is a full-stack AI-powered chatbot application built with
**React, Node.js, Express, MongoDB and Google Gemini API**.

It provides an interactive conversational experience with authentication,
chat history, multilingual support, voice input, voice output and a modern
responsive interface.

---

## ✨ Features

### 🤖 AI Chat
- Chat with an AI assistant powered by Google Gemini.
- Real-time conversation experience.
- Loading/typing indicator while the AI is responding.
- Handles backend/API errors gracefully.

### 🔐 Authentication
- User Sign Up
- User Login
- User Logout
- JWT-based authentication
- Protected chat history
- User-specific conversations

### 💬 Chat Management
- Create a new chat
- Continue previous conversations
- View chat history
- Open previous chats
- Clear current conversation
- Automatically save chat ID

### 🎙️ Voice Input
Use your microphone to speak directly to the chatbot.

- Browser speech recognition
- Microphone button
- Automatic speech-to-text
- Supports multiple languages

> **Tip:** Google Chrome provides the best browser support for speech
> recognition.

### 🔊 AI Voice Output

The chatbot can read AI responses aloud using the browser's
Speech Synthesis API.

Features:

- Automatic AI voice response
- 🔊 Read individual AI messages
- 🔇 Stop voice
- Language-dependent speech output

### 🌐 Multilingual Support

The language selector currently contains:

| # | Language |
|---|---|
| 1 | 🇬🇧 English |
| 2 | 🇮🇳 Hindi |
| 3 | 🇮🇳 Bengali |
| 4 | 🇮🇳 Gujarati |
| 5 | 🇮🇳 Kannada |
| 6 | 🇮🇳 Malayalam |
| 7 | 🇮🇳 Marathi |
| 8 | 🇮🇳 Punjabi |
| 9 | 🇮🇳 Tamil |
| 10 | 🇮🇳 Telugu |
| 11 | 🇮🇳 Urdu |
| 12 | 🇮🇳 Odia |
| 13 | 🇮🇳 Assamese |
| 14 | 🇮🇳 Sanskrit |

The selected language is used for browser speech recognition and
speech synthesis.

### 🌙 Dark Mode

Switch between:

- ☀️ Light Mode
- 🌙 Dark Mode

### 🎨 Modern UI

The application includes:

- AI-themed interface
- Responsive chat layout
- Sidebar chat history
- Large chat/message boxes
- Modern buttons
- Language selector
- Voice controls
- Error notifications
- Welcome screen

---

# 🛠️ Tech Stack

## Frontend

- React
- JavaScript
- HTML5
- CSS3
- Vite
- Web Speech API

## Backend

- Node.js
- Express.js
- JavaScript
- JWT Authentication
- REST API

## Database

- MongoDB
- Mongoose

## AI

- Google Gemini API

## Development Tools

- VS Code
- Git
- GitHub
- npm

---

# 📁 Project Structure

```text
my-ai-chatbot/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/
│   │
│   ├── models/
│   │
│   ├── routes/
│   │
│   ├── middleware/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
│
└── README.md
