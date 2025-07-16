import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

import {
  uploadPost,
  getAllPosts,
  like,
  saved,
  comment,
  deletePost
} from "../controllers/post.controllers.js";

const postRouter = express.Router();

// ✅ Upload post: supports media or text-only
postRouter.post("/upload", isAuth, upload.single("media"), uploadPost);

// ✅ Get all posts
postRouter.get("/getAll", isAuth, getAllPosts);

// ✅ Like post
postRouter.get("/like/:postId", isAuth, like);

// ✅ Save/Unsave post
postRouter.get("/saved/:postId", isAuth, saved);

// ✅ Comment on post
postRouter.post("/comment/:postId", isAuth, comment);

// ✅ Delete post
postRouter.delete("/delete/:postId", isAuth, deletePost);

export default postRouter;
