import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [chatId, setChatId] = useState("default-chat");

  const [chatHistory, setChatHistory] = useState([]);

  // ==========================
  // LOAD CHAT HISTORY LIST
  // ==========================
  useEffect(() => {
    if(chatId) return;
    async function loadChats() {
      try {
        const response = await fetch(`${API_URL}/api/chats`);

        if (!response.ok) {
          throw new Error("Failed to load chats");
        }

        const data = await response.json();

        setChatHistory(data);
      } catch (error) {
        console.error("Chat history error:", error);
      }
    }

    loadChats();
  }, []);

  // ==========================
  // LOAD SELECTED CHAT
  // ==========================
  useEffect(() => {
    if (!chatId) return;

    async function loadMessages() {
      try {
        const response = await fetch(
          `${API_URL}/api/messages/${chatId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load messages");
        }

        const data = await response.json();

        setMessages(
          data.map((message) => ({
            id: message._id,
            sender: message.sender,
            text: message.text,
          }))
        );
      } catch (error) {
        console.error("Messages error:", error);
      }
    }

    loadMessages();
  }, [chatId]);

  // ==========================
  // SEND MESSAGE
  // ==========================
  async function sendMessage() {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: text,
          chatId: chatId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong"
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

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.reply,
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);

      // Refresh history list
      const historyResponse = await fetch(
        `${API_URL}/api/chats`
      );

      if (historyResponse.ok) {
        const historyData =
          await historyResponse.json();

        setChatHistory(historyData);
      }
    } catch (error) {
      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "Sorry, I couldn't connect to the AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // ==========================
  // OPEN OLD CHAT
  // ==========================
  function openChat(id) {
    setChatId(id);

    localStorage.setItem("chatId", id);
  }

  // ==========================
  // NEW CHAT
  // ==========================
  function newChat() {
    setChatId(null);

    localStorage.removeItem("chatId");

    setMessages([]);
    setInput("");
  }

  // ==========================
  // CLEAR CURRENT CHAT
  // ==========================
  function clearChat() {
    setMessages([]);
  }

  // ==========================
  // ENTER KEY
  // ==========================
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }

  return (
    <div
      className={
        darkMode ? "app dark" : "app"
      }
    >

      {/* ==========================
          SIDEBAR
      ========================== */}

      <aside className="history-sidebar">

        <button
          className="new-chat-button"
          onClick={newChat}
        >
          ➕ New Chat
        </button>

        <h2>💬 Chat History</h2>

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
              {chat.firstMessage.length > 35
                ? chat.firstMessage.substring(
                    0,
                    35
                  ) + "..."
                : chat.firstMessage}
            </button>

          ))
        )}

      </aside>

      {/* ==========================
          CHAT
      ========================== */}

      <div className="chat-container">

        {/* Header */}

        <header className="header">

          <div>
            <h1>🤖 My AI Chatbot</h1>

            <p>
              Powered by Gemini
            </p>
          </div>

          <button
            className="theme-button"
            onClick={() =>
              setDarkMode(!darkMode)
            }
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

        </header>

        {/* Toolbar */}

        <div className="toolbar">

          <button onClick={clearChat}>
            🗑️ Clear Chat
          </button>

        </div>

        {/* Messages */}

        <main className="messages">

          {messages.length === 0 &&
            !loading && (

              <div className="welcome">

                <div className="robot">
                  🤖
                </div>

                <h2>
                  Hello! 👋
                </h2>

                <p>
                  I'm your AI assistant.
                </p>

                <p>
                  Ask me anything!
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

        {/* Input */}

        <div className="input-area">

          <input
            type="text"
            value={input}
            placeholder="Ask me anything..."
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={sendMessage}
            disabled={
              !input.trim() || loading
            }
          >
            {loading ? "..." : "Send"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default App;