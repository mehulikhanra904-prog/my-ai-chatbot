const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);