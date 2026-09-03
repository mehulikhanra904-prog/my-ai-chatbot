import { useEffect, useState, useRef } from "react";
import "./App.css";

import Login from "./components/Login";
import Signup from "./components/Signup";
import { getApiUrl } from "./config";

// ======================================================
// API
// ======================================================

function buildApiUrl(path) {
  return getApiUrl(path);
}

// ======================================================
// LANGUAGES
// 13 INDIAN LANGUAGES + ENGLISH
// ======================================================

const languages = [
  { code: "en-US", name: "🇬🇧 English" },
  { code: "hi-IN", name: "🇮🇳 हिन्दी (Hindi)" },
  { code: "bn-IN", name: "🇮🇳 বাংলা (Bengali)" },
  { code: "gu-IN", name: "🇮🇳 ગુજરાતી (Gujarati)" },
  { code: "kn-IN", name: "🇮🇳 ಕನ್ನಡ (Kannada)" },
  { code: "ml-IN", name: "🇮🇳 മലയാളം (Malayalam)" },
  { code: "mr-IN", name: "🇮🇳 मराठी (Marathi)" },
  { code: "pa-IN", name: "🇮🇳 ਪੰਜਾਬੀ (Punjabi)" },
  { code: "ta-IN", name: "🇮🇳 தமிழ் (Tamil)" },
  { code: "te-IN", name: "🇮🇳 తెలుగు (Telugu)" },
  { code: "ur-IN", name: "🇮🇳 اردو (Urdu)" },
  { code: "or-IN", name: "🇮🇳 ଓଡ଼ିଆ (Odia)" },
  { code: "as-IN", name: "🇮🇳 অসমীয়া (Assamese)" },
  { code: "sa-IN", name: "🇮🇳 संस्कृतम् (Sanskrit)" },
];

// ======================================================
// APP
// ======================================================

function App() {
  // ====================================================
  // AUTH
  // ====================================================

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [showSignup, setShowSignup] = useState(false);

  // ====================================================
  // CHAT
  // ====================================================

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [chatId, setChatId] = useState(
    () => localStorage.getItem("chatId") || null
  );

  const [chatHistory, setChatHistory] = useState([]);

  const [darkMode, setDarkMode] = useState(false);

  // ====================================================
  // VOICE
  // ====================================================

  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // ====================================================
  // AUTH HELPERS
  // ====================================================

  function getToken() {
    return localStorage.getItem("token");
  }

  function getAuthHeaders() {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  }

  // ====================================================
  // JSON HELPER
  // ====================================================

  async function parseJSON(response) {
    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();

      throw new Error(
        `Unexpected server response: ${text}`
      );
    }

    return response.json();
  }

  // ====================================================
  // LOGIN
  // ====================================================

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setShowSignup(false);
    setMessages([]);
    setChatHistory([]);
    setError(null);

    const savedChatId =
      localStorage.getItem("chatId");

    setChatId(savedChatId || null);
  }

  // ====================================================
  // LOGOUT
  // ====================================================

  function handleLogout() {
    stopSpeaking();
    stopListening();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("chatId");

    setUser(null);
    setMessages([]);
    setChatHistory([]);
    setChatId(null);
    setInput("");
    setError(null);
  }

  // ====================================================
  // LOAD CHAT HISTORY
  // ====================================================

  useEffect(() => {
    if (!user) return;

    async function loadChats() {
      try {
        const response = await fetch(
          buildApiUrl("/api/chats"),
          {
            headers: getAuthHeaders(),
          }
        );

        if (response.status === 401) {
          handleLogout();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load chats");
        }

        const data = await parseJSON(response);

        setChatHistory(data);
      } catch (err) {
        console.error("Chat history error:", err);

        setError(
          "Unable to load chat history. Check the backend."
        );
      }
    }

    loadChats();
  }, [user]);

  // ====================================================
  // LOAD SELECTED CHAT
  // ====================================================

  useEffect(() => {
    if (!user || !chatId) return;

    async function loadMessages() {
      try {
        const response = await fetch(
          buildApiUrl(`/api/messages/${chatId}`),
          {
            headers: getAuthHeaders(),
          }
        );

        if (response.status === 401) {
          handleLogout();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load messages");
        }

        const data = await parseJSON(response);

        setMessages(
          data.map((message) => ({
            id: message._id,
            sender: message.sender,
            text: message.text,
          }))
        );
      } catch (err) {
        console.error("Messages error:", err);
      }
    }

    loadMessages();
  }, [chatId, user]);

  // ====================================================
  // SPEECH INPUT
  // ====================================================

  function stopListening() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        console.warn("Error aborting speech recognition:", err);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }

  async function toggleVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    // Stop speaking if currently speaking
    stopSpeaking();
    setError(null);

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = selectedLanguage || "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("🎙️ Speech recognition started");
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        console.log("🎤 Speech result received:", event);

        let transcript = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          transcript += event.results[i][0].transcript;
        }

        transcript = transcript.trim();

        if (transcript) {
          console.log("📝 Recognized text:", transcript);

          setInput((previous) => {
            if (previous.trim()) {
              return `${previous} ${transcript}`;
            }

            return transcript;
          });
        }
      };

      recognition.onerror = (event) => {
        console.error(
          "❌ Speech recognition error:",
          event.error
        );

        setIsListening(false);
        recognitionRef.current = null;

        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          setError(
            "Microphone permission was denied. Please allow microphone access in your browser address bar (lock/tune icon)."
          );
        } else if (event.error === "network") {
          setError(
            `Speech recognition server could not be reached for ${selectedLanguage}. Please check your internet connection or switch language to English/Hindi.`
          );
        } else if (event.error === "no-speech") {
          console.log("No speech detected.");
        } else if (event.error === "audio-capture") {
          setError(
            "No microphone was detected. Please check your microphone input device."
          );
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log("🎙️ Speech recognition ended");
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (error) {
      console.error(
        "Could not start speech recognition:",
        error
      );

      setIsListening(false);
      recognitionRef.current = null;
    }
  }

  

  // ====================================================
  // SPEECH OUTPUT
  // ====================================================

  function speakText(text) {
    if (!window.speechSynthesis) {
      alert(
        "Voice output is not supported in this browser."
      );
      return;
    }

    if (!text) return;

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.lang = selectedLanguage;
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      setIsSpeaking(true);
    };

    speech.onend = () => {
      setIsSpeaking(false);
    };

    speech.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  }

  // ====================================================
  // STOP SPEAKING
  // ====================================================

  function stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  }

  // ====================================================
  // SEND MESSAGE
  // ====================================================

  async function sendMessage() {
  const text = input.trim();

  if (!text || loading) return;

  const userMessage = {
    id: Date.now(),
    sender: "user",
    text: text,
  };

  setMessages((previous) => [
    ...previous,
    userMessage,
  ]);

  setInput("");
  setLoading(true);
  setError(null);

  try {
    const response = await fetch(
        buildApiUrl("/api/chat"),
        {
          method: "POST",

          headers: getAuthHeaders(),

          body: JSON.stringify({
            message: text,
            chatId,
          }),
        }
      );

      const data = await parseJSON(response);

      if (response.status === 401) {
        handleLogout();

        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Something went wrong."
        );
      }

      // Save chat ID
      if (data.chatId) {
        setChatId(data.chatId);

        localStorage.setItem(
          "chatId",
          data.chatId
        );
      }

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.reply,
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);

      // Speak AI response
      speakText(data.reply);

      // Refresh history
      const historyResponse =
        await fetch(
          buildApiUrl("/api/chats"),
          {
            headers: getAuthHeaders(),
          }
        );

      if (historyResponse.ok) {
        const historyData =
          await parseJSON(historyResponse);

        setChatHistory(historyData);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Sorry, the AI is currently unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // OPEN CHAT
  // ====================================================

  function openChat(id){
    stopSpeaking();
    stopListening();

    setChatId(id);

    localStorage.setItem("chatId", id);

    setError(null);
  }

  // ====================================================
  // NEW CHAT
  // ====================================================

  function newChat() {
    stopSpeaking();
    stopListening();

    setChatId(null);
    setMessages([]);
    setInput("");
    setError(null);

    localStorage.removeItem("chatId");
  }

  // ====================================================
  // CLEAR CHAT
  // ====================================================

  function clearChat() {
    stopSpeaking();
    stopListening();

    setMessages([]);
    setError(null);
  }

  // ====================================================
  // ENTER KEY
  // ====================================================

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  // ====================================================
  // LOGIN / SIGNUP
  // ====================================================

  if (!user) {
    if (showSignup) {
      return (
        <Signup
          switchToLogin={() =>
            setShowSignup(false)
          }
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        switchToSignup={() =>
          setShowSignup(true)
        }
      />
    );
  }

  // ====================================================
  // MAIN APP
  // ====================================================

  return (
    <div
      className={
        darkMode
          ? "app dark"
          : "app"
      }
    >
      {/* ================================================
          SIDEBAR
      ================================================= */}

      <aside className="history-sidebar">

        <button
          className="new-chat-button"
          onClick={newChat}
        >
          ➕ New Chat
        </button>

        <h2>
          💬 Chat History
        </h2>

        {chatHistory.length === 0 ? (
          <p className="no-history">
            No previous chats
          </p>
        ) : (
          chatHistory.map((chat) => (
            <button
              key={chat._id}
              className={
                chat._id === chatId
                  ? "history-item active"
                  : "history-item"
              }
              onClick={() =>
                openChat(chat._id)
              }
            >
              {chat.firstMessage
                ? chat.firstMessage.length > 35
                  ? chat.firstMessage.substring(
                      0,
                      35
                    ) + "..."
                  : chat.firstMessage
                : "New Chat"}
            </button>
          ))
        )}
      </aside>

      {/* ================================================
          CHAT AREA
      ================================================= */}

      <div className="chat-container">

        {/* HEADER */}

        <header className="header">

          <div>
            <h1>
              🤖 My AI Chatbot
            </h1>

            <p>
              Powered by Gemini
            </p>
          </div>

          <div className="header-right">

            <span className="user-name">
              👤 {user.name}
            </span>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

            <button
              className="theme-button"
              onClick={() =>
                setDarkMode(
                  !darkMode
                )
              }
            >
              {darkMode
                ? "☀️"
                : "🌙"}
            </button>

          </div>
        </header>

        {/* TOOLBAR */}

        <div className="toolbar">

          <select
            className="language-select"
            value={selectedLanguage}
            onChange={(event) => {
              stopSpeaking();

              setSelectedLanguage(
                event.target.value
              );
            }}
          >
            {languages.map(
              (language) => (
                <option
                  key={language.code}
                  value={language.code}
                >
                  {language.name}
                </option>
              )
            )}
          </select>

          <button onClick={clearChat}>
            🗑️ Clear Chat
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
            >
              🔇 Stop Voice
            </button>
          )}

        </div>

        {/* ERROR */}

        {error && (
          <div className="error-banner">
            <strong>
              Error:
            </strong>{" "}
            {error}
          </div>
        )}

        {/* MESSAGES */}

        <main className="messages">

          {messages.length === 0 &&
            !loading && (
              <div className="welcome">

                <div className="robot">
                  🤖
                </div>

                <h2>
                  Hello, {user.name}! 👋
                </h2>

                <p>
                  I'm your AI assistant.
                </p>

                <p>
                  Select a language and
                  ask me anything!
                </p>

              </div>
            )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender}`}
            >

              <div className="message-name">
                {message.sender === "user"
                  ? "You"
                  : "🤖 AI"}
              </div>

              <div className="message-text">
                {message.text}
              </div>

              {message.sender === "ai" && (
                <button
                  className="message-speak-button"
                  onClick={() =>
                    speakText(
                      message.text
                    )
                  }
                  title="Read aloud"
                >
                  🔊
                </button>
              )}

            </div>
          ))}

          {loading && (
            <div className="message ai">

              <div className="message-name">
                🤖 AI
              </div>

              <div className="typing">
                <span></span>
                <span></span>
                <span></span>
              </div>

            </div>
          )}

        </main>

        {/* INPUT */}

        <div className="input-area">

          <button
            className="voice-button"
            onClick={
              toggleVoiceInput
            }
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening
              ? "🔴"
              : "🎙️"}
          </button>

          <input
            type="text"
            value={input}
            placeholder={
              isListening
                ? "Listening..."
                : "Ask me anything..."
            }
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
          />

          <button
            onClick={sendMessage}
            disabled={
              !input.trim() ||
              loading
            }
          >
            {loading
              ? "..."
              : "Send"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default App;

  