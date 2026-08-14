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
