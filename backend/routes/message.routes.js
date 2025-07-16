import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  sendMessage,
  getAllMessages,
  getPrevUserChats,
  reactToMessage,
  deleteMessage
} from "../controllers/message.controllers.js";

const messageRouter = express.Router();

// Send a message (with optional image)
messageRouter.post("/send/:receiverId", isAuth, upload.single("image"), sendMessage);

// Get all messages with a specific user
messageRouter.get("/getAll/:receiverId", isAuth, getAllMessages);

// Get previous users you've chatted with
messageRouter.get("/prevChats", isAuth, getPrevUserChats);

// ✅ React to a message using emoji (this must match frontend call)
messageRouter.post("/react/:messageId", isAuth, reactToMessage);

// ✅ Delete a message (must match frontend call)
messageRouter.delete("/delete/:messageId", isAuth, deleteMessage);

export default messageRouter;
