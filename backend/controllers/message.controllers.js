import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getSocketId, io } from "../socket.js";

// ✅ Send Message (text or image)
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;
    const { message } = req.body;

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message,
      image,
    });

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [newMessage._id],
      });
    } else {
      conversation.messages.push(newMessage._id);
      await conversation.save();
    }

    const receiverSocketId = getSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(200).json(newMessage);
  } catch (error) {
    return res.status(500).json({ message: `send Message error ${error}` });
  }
};

// ✅ Get All Messages Between Users (excluding deleted)
export const getAllMessages = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    const messages = conversation?.messages.filter(m => !m.isDeleted) || [];

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: `get Message error ${error}` });
  }
};

// ✅ Get Previous Chats List
export const getPrevUserChats = async (req, res) => {
  try {
    const currentUserId = req.userId;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate("participants")
      .sort({ updatedAt: -1 });

    const userMap = {};
    conversations.forEach((conv) => {
      conv.participants.forEach((user) => {
        if (user._id != currentUserId) {
          userMap[user._id] = user;
        }
      });
    });

    const previousUsers = Object.values(userMap);
    return res.status(200).json(previousUsers);
  } catch (error) {
    return res.status(500).json({ message: `prev user error ${error}` });
  }
};

// ✅ React to a message with emoji
export const reactToMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const { emoji } = req.body;

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { reaction: emoji },
      { new: true }
    );

    const receiverSocketId = getSocketId(updated.receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("reactedMessage", updated);
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: `react to message error ${error}` });
  }
};

// ✅ Soft Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Ensure only the sender can delete the message
    if (message.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    message.isDeleted = true;
    await message.save();

    const receiverSocketId = getSocketId(message.receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("deletedMessage", { _id: messageId });
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `delete message error ${error}` });
  }
};
