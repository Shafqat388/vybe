import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  editProfile,
  follow,
  followingList,
  getAllNotifications,
  getCurrentUser,
  getProfile,
  markAsRead,
  search,
  suggestedUsers,
  deleteNotification,      // ✅ Delete Notification Controller
  deleteAccount            // ✅ Delete Account Controller
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

// ✅ User Profile and Account
userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/editProfile", isAuth, upload.single("profileImage"), editProfile);
userRouter.delete("/deleteAccount", isAuth, deleteAccount);  // ✅ NEW Route: Delete Account

// ✅ Social Features
userRouter.get("/suggested", isAuth, suggestedUsers);
userRouter.get("/getProfile/:userName", isAuth, getProfile);
userRouter.get("/follow/:targetUserId", isAuth, follow);
userRouter.get("/followingList", isAuth, followingList);

// ✅ Search
userRouter.get("/search", isAuth, search);

// ✅ Notifications
userRouter.get("/getAllNotifications", isAuth, getAllNotifications);
userRouter.post("/markAsRead", isAuth, markAsRead);
userRouter.delete("/deleteNotification/:id", isAuth, deleteNotification);  // ✅ Delete Notification

export default userRouter;
