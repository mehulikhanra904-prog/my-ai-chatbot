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

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("========== MONGODB ERROR ==========");
    console.error(error);
    console.error("==================================");
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
    await Message.create({
      chatId: currentChatId,
      sender: "user",
      text: message,
    });

    // ==========================
    // GEMINI
    // ==========================

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
    });

    const reply = response.text;

    // Save AI response
    await Message.create({
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
    const messages = await Message.find({
      chatId: req.params.chatId,
    }).sort({
      createdAt: 1,
    });

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
    const chats = await Message.aggregate([
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

const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running on port ${PORT}`
  );
});