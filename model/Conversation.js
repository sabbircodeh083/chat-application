//external Import
const mongoose = require("mongoose");
//Internal Import

const conversationSchema = new mongoose.Schema(
  {
    creator: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: String,
    },
    participant: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: String,
    },
    last_update: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const model = mongoose.model("Conversation", conversationSchema);

module.exports = model;
