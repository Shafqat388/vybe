import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
  },
  image: {
    type: String,
  },

  // ✅ Emoji reaction (e.g., 👍, ❤️, 😂)
  reaction: {
    type: String,
    default: null,
  },

  // ✅ Flag to soft-delete message
  isDeleted: {
    type: Boolean,
    default: false,
  }

}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;
