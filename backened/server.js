require("dotenv").config();

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

// ==========================
// Middleware
// ==========================

app.use(cors());
app.use(express.json());

// ==========================
// Gemini AI
// ==========================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
console.log("Gemini key exists:", !!process.env.GEMINI_API_KEY);
// ==========================
// MongoDB Schema
// ==========================

const messageSchema = new mongoose.Schema(
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
  try {
    const { message, chatId } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Create a chat ID if one doesn't exist
    const currentChatId =
      chatId || Date.now().toString();

    // Save user's message
    await saveMessage({
      chatId: currentChatId,
      sender: "user",
      text: message,
    });

    // ==========================
    // GEMINI
    // =========================

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
    });
    console.log("Gemini response received");
    console.log(response);

    const reply = response.text;

    // Save AI response
    await saveMessage({
      chatId: currentChatId,
      sender: "ai",
      text: reply,
    });

    // Send response to React
    res.json({
      reply: reply,
      chatId: currentChatId,
    });
  } catch (error) {
    console.log("Chat error:", error.message);

    res.status(500).json({
      error: "Failed to get AI response",
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