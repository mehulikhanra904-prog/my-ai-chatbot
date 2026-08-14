require("dotenv").config();

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

const useAIFallback =
  process.env.USE_AI_FALLBACK !== "false";
const aiFallbackReply =
  process.env.AI_FALLBACK_REPLY ||
  "I'm temporarily unable to access the AI service right now. Please try again in a moment.";

console.log("AI fallback enabled:", useAIFallback);

// ==========================
// Middleware
// ==========================

app.use(cors());
app.use(express.json());

// ==========================
// Gemini AI
// ==========================

const ai = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
console.log("Gemini key exists:", !!process.env.GEMINI_API_KEY);
// ==========================
// MongoDB Schema
// ==========================

const  messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
    },

    sender: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

// ==========================
// MongoDB Connection
// ==========================

const dbState = {
  connected: false,
};

const localMessages = [];

const saveMessage = async (messageData) => {
  if (dbState.connected) {
    return Message.create(messageData);
  }

  const localMessage = {
    ...messageData,
    _id: `${Date.now()}-${Math.random()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  localMessages.push(localMessage);
  return localMessage;
};

const findMessagesByChatId = async (chatId) => {
  if (dbState.connected) {
    return Message.find({ chatId }).sort({ createdAt: 1 });
  }

  return localMessages
    .filter((message) => message.chatId === chatId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

const getChatsSummary = async () => {
  if (dbState.connected) {
    return Message.aggregate([
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: "$chatId",
          firstMessage: {
            $first: "$text",
          },
          createdAt: {
            $first: "$createdAt",
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
  }

  const chats = Object.values(
    localMessages.reduce((acc, message) => {
      if (!acc[message.chatId]) {
        acc[message.chatId] = {
          _id: message.chatId,
          firstMessage: message.text,
          createdAt: message.createdAt,
        };
      }
      return acc;
    }, {})
  );

  return chats.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    dbState.connected = true;
  })
  .catch((error) => {
    console.error("========== MONGODB ERROR ==========");
    console.error(error);
    console.error("==================================");
    console.warn("Using local in-memory storage instead of MongoDB.");
  });

// ==========================
// Home Route
// ==========================

app.get("/", (req, res) => {
  res.send("AI Chatbot Backend Running");
});

// ==========================
// CHAT + GEMINI + SAVE
// ==========================

app.post("/api/chat", async (req, res) => {
  const { message, chatId } = req.body;
  const currentChatId = chatId || Date.now().toString();

  if (!message) {
    return res.status(400).json({
      error: "Message is required",
    });
  }

  try {
    // Save user's message
    await saveMessage({
      chatId: currentChatId,
      sender: "user",
      text: message,
    });

    // ==========================
    // GEMINI
    // =========================

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(message);
    console.log("Gemini response received");
    
    const reply = response.response.text();

    // Save AI response
    await saveMessage({
      chatId: currentChatId,
      sender: "ai",
      text: reply,
    });

    // Send response to React
    return res.json({
      reply,
      chatId: currentChatId,
    });
  } catch (error) {
    console.log("Chat error:", error?.message || error);
    console.log(error);

    const fallbackReply = aiFallbackReply;
    const plainError =
      error?.error?.message ||
      error?.message ||
      "Failed to get AI response";

    if (useAIFallback) {
      await saveMessage({
        chatId: currentChatId,
        sender: "ai",
        text: fallbackReply,
      });

      return res.status(200).json({
        reply: fallbackReply,
        chatId: currentChatId,
        fallback: true,
      });
    }

    return res.status(503).json({
      error: plainError,
    });
  }
});

// ==========================
// GET MESSAGES OF ONE CHAT
// ==========================

app.get("/api/messages/:chatId", async (req, res) => {
  try {
    const messages = await findMessagesByChatId(
      req.params.chatId
    );

    res.json(messages);
  } catch (error) {
    console.log(
      "Error loading messages:",
      error.message
    );

    res.status(500).json({
      error: "Failed to load messages",
    });
  }
});

// ==========================
// GET ALL CHAT HISTORY
// ==========================

app.get("/api/chats", async (req, res) => {
  try {
    const chats = await getChatsSummary();

    res.json(chats);
  } catch (error) {
    console.log(
      "Error loading chat history:",
      error.message
    );

    res.status(500).json({
      error: "Failed to load chat history",
    });
  }
});

// ==========================
// START SERVER
// ==========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});