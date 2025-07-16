import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  comment,
  getAllLoops,
  like,
  uploadLoop,
  deleteLoop,
  saveLoop
} from "../controllers/loop.controllers.js";

const loopRouter = express.Router();

// Upload new loop (reel)
loopRouter.post("/upload", isAuth, upload.single("media"), uploadLoop);

// Get all loops
loopRouter.get("/getAll", isAuth, getAllLoops);

// Like a loop
loopRouter.get("/like/:loopId", isAuth, like);

// Comment on a loop
loopRouter.post("/comment/:loopId", isAuth, comment);

// ✅ Delete a loop (Only author can delete)
loopRouter.delete("/delete/:loopId", isAuth, deleteLoop);

// ✅ Save/Unsave route
loopRouter.get("/save/:loopId", isAuth, saveLoop);

export default loopRouter;
